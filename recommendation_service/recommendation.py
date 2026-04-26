"""
recommendation.py
=================
Full recommendation pipeline + FastAPI endpoints.
Updated to match actual database schema (Sequelize camelCase columns).

Column name changes from original:
  created_at  → createdAt
  resolved_at → resolved_at  (stays snake_case — it's actually resolved_at in schema)
  student_id  → user_id      (complaints table uses user_id)
"""

import os
import json
import logging
from datetime import datetime, timedelta
from typing import Optional

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from groq import Groq
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from database import get_db
from models import AiRecommendation
from translation import translate_to_english

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL   = "llama-3.1-8b-instant"
CACHE_HOURS  = int(os.getenv("RECOMMENDATION_CACHE_HOURS", "24"))

logger = logging.getLogger(__name__)
router = APIRouter()


# ─────────────────────────────────────────────
# Pydantic schemas
# ─────────────────────────────────────────────

class RecommendationOut(BaseModel):
    id:               int
    category_id:      int
    pattern_detected: str
    recommendation:   str
    root_cause:       Optional[str]
    urgency:          Optional[str]
    estimated_impact: Optional[str]
    location:         Optional[str]
    complaint_count:  Optional[int]
    avg_resolution_h: Optional[int]
    appeal_rate_pct:  Optional[int]
    top_keywords:     Optional[str]
    status:           Optional[str]
    generated_at:     Optional[datetime]

    class Config:
        from_attributes = True


class StatusUpdate(BaseModel):
    status: str  # "implemented" or "ignored"


# ─────────────────────────────────────────────
# Step 1: Fetch complaints from MySQL
# ─────────────────────────────────────────────

# Note: complaints uses createdAt (Sequelize) but resolved_at (manual column)
FETCH_SQL = text("""
    SELECT
        c.id,
        c.problem,
        c.ai_summary,
        c.priority,
        c.status,
        c.createdAt,
        c.resolved_at,
        c.location,
        cat.id   AS category_id,
        cat.name AS category_name,
        (SELECT COUNT(*) FROM appeals a WHERE a.complaint_id = c.id) AS has_appeal
    FROM complaints c
    JOIN categories cat ON c.category_id = cat.id
    WHERE c.createdAt >= NOW() - INTERVAL 90 DAY
    ORDER BY c.createdAt DESC
    LIMIT 200
""")


def fetch_complaints(db: Session) -> pd.DataFrame:
    result = db.execute(FETCH_SQL)
    rows   = result.fetchall()
    cols   = list(result.keys())
    df     = pd.DataFrame(rows, columns=cols)

    if df.empty:
        return df

    # Translate any Arabic complaints to English before analysis
    df["problem"] = translate_to_english(df["problem"].tolist())
    if "ai_summary" in df.columns and df["ai_summary"].notna().any():
        df["ai_summary"] = translate_to_english(df["ai_summary"].fillna("").tolist())

    # Derived columns — use actual column names from schema
    df["resolution_hours"] = (
        (pd.to_datetime(df["resolved_at"]) - pd.to_datetime(df["createdAt"]))
        .dt.total_seconds() / 3600
    ).clip(lower=0)

    df["has_appeal"]       = df["has_appeal"].astype(int)
    df["is_high_priority"] = (pd.to_numeric(df["priority"], errors="coerce").fillna(0) >= 4).astype(int)
    df["day_of_week"]      = pd.to_datetime(df["createdAt"]).dt.day_name()
    df["month"]            = pd.to_datetime(df["createdAt"]).dt.month_name()

    return df


# ─────────────────────────────────────────────
# Step 2: Statistical analysis with Pandas
# ─────────────────────────────────────────────

def compute_statistics(df: pd.DataFrame) -> pd.DataFrame:
    def safe_mode(series):
        m = series.mode()
        return m.iloc[0] if not m.empty else "N/A"

    stats = (
        df.groupby(["category_id", "category_name", "location"])
        .agg(
            complaint_count    = ("id",                "count"),
            avg_res_hours      = ("resolution_hours",  "mean"),
            appeal_rate        = ("has_appeal",        "mean"),
            high_priority_rate = ("is_high_priority",  "mean"),
            peak_day           = ("day_of_week",       safe_mode),
            peak_month         = ("month",             safe_mode),
        )
        .reset_index()
    )

    # Only groups with 3+ complaints have enough signal
    stats = stats[stats["complaint_count"] >= 3].copy()

    stats["avg_res_hours"]     = stats["avg_res_hours"].round(1)
    stats["appeal_rate_pct"]   = (stats["appeal_rate"]        * 100).round(1)
    stats["high_priority_pct"] = (stats["high_priority_rate"] * 100).round(1)

    return stats


# ─────────────────────────────────────────────
# Step 3: TF-IDF keyword extraction
# ─────────────────────────────────────────────

def extract_keywords(texts: list, top_n: int = 8) -> list:
    clean = [str(t).strip() for t in texts if t and str(t).strip()]
    if len(clean) < 2:
        return []
    try:
        vectorizer   = TfidfVectorizer(stop_words="english", max_features=100, ngram_range=(1, 2), min_df=1)
        tfidf_matrix = vectorizer.fit_transform(clean)
        scores       = tfidf_matrix.mean(axis=0).A1
        terms        = vectorizer.get_feature_names_out()
        top_indices  = scores.argsort()[-top_n:][::-1]
        return [terms[i] for i in top_indices]
    except Exception as exc:
        logger.warning("TF-IDF failed: %s", exc)
        return []


def get_sample_texts(group_df: pd.DataFrame, n: int = 5) -> list:
    col = "ai_summary" if group_df["ai_summary"].notna().any() else "problem"
    return group_df[col].dropna().head(n).tolist()


# ─────────────────────────────────────────────
# Step 4: Groq LLM call
# ─────────────────────────────────────────────

SYSTEM_PROMPT = (
    "You are an expert complaints analyst for a university student complaints system. "
    "Produce professional, actionable recommendations for university management. "
    "Always respond with ONLY valid JSON — no markdown, no explanation, no preamble."
)

RECOMMENDATION_TEMPLATE = """
Analyze the following student complaint pattern and generate a structured recommendation.

=== STATISTICAL DATA ===
Category:              {category_name}
Location:              {location}
Total complaints:      {complaint_count} (last 90 days)
Avg resolution time:   {avg_res_hours} hours
Appeal rate:           {appeal_rate_pct}%
High-priority rate:    {high_priority_pct}%
Peak complaint day:    {peak_day}
Peak complaint month:  {peak_month}

=== TOP RECURRING KEYWORDS (TF-IDF) ===
{keywords}

=== SAMPLE COMPLAINT SUMMARIES ===
{sample_texts}

Respond ONLY with this JSON:
{{
  "pattern_detected": "one sentence describing the pattern",
  "root_cause": "one sentence on the likely underlying cause",
  "recommendation": "one specific actionable step for management",
  "urgency": "high or medium or low",
  "estimated_impact": "expected outcome if recommendation is applied"
}}
"""


def call_groq(prompt: str) -> dict:
    client   = Groq(api_key=GROQ_API_KEY)
    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": prompt},
        ],
        temperature=0.3,
        max_tokens=512,
    )
    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())


# ─────────────────────────────────────────────
# Step 5: Cache check & save
# ─────────────────────────────────────────────

def get_cached(db: Session, category_id: int, location: str) -> Optional[AiRecommendation]:
    cutoff = datetime.utcnow() - timedelta(hours=CACHE_HOURS)
    return (
        db.query(AiRecommendation)
        .filter(
            AiRecommendation.category_id  == category_id,
            AiRecommendation.location     == location,
            AiRecommendation.generated_at >= cutoff,
        )
        .order_by(AiRecommendation.generated_at.desc())
        .first()
    )


def save_recommendation(db, category_id, location, stats, groq_result, keywords):
    rec = AiRecommendation(
        category_id      = category_id,
        location         = location,
        pattern_detected = groq_result.get("pattern_detected", ""),
        recommendation   = groq_result.get("recommendation", ""),
        root_cause       = groq_result.get("root_cause"),
        urgency          = groq_result.get("urgency", "medium"),
        estimated_impact = groq_result.get("estimated_impact"),
        complaint_count  = int(stats.get("complaint_count", 0)),
        avg_resolution_h = int(stats.get("avg_res_hours", 0)),
        appeal_rate_pct  = int(stats.get("appeal_rate_pct", 0)),
        top_keywords     = ", ".join(keywords),
        status           = "pending",
        generated_at     = datetime.utcnow(),
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec


# ─────────────────────────────────────────────
# Main pipeline
# ─────────────────────────────────────────────

def run_recommendation_pipeline(db: Session) -> list:
    logger.info("Starting recommendation pipeline...")

    df = fetch_complaints(db)
    if df.empty:
        logger.warning("No complaints found in the last 90 days.")
        return []

    stats_df = compute_statistics(df)
    if stats_df.empty:
        logger.warning("No groups with 3+ complaints found.")
        return []

    results = []

    for _, row in stats_df.iterrows():
        cat_id   = int(row["category_id"])
        location = str(row["location"]) if row["location"] else "Unknown"

        # Cache check
        cached = get_cached(db, cat_id, location)
        if cached:
            logger.info("Cache hit: category=%s location=%s", cat_id, location)
            results.append(cached)
            continue

        # Get texts for this group
        mask         = (df["category_id"] == cat_id) & (df["location"] == row["location"])
        group_df     = df[mask]
        keywords     = extract_keywords(group_df["problem"].tolist())
        sample_texts = get_sample_texts(group_df)

        # Build prompt
        prompt = RECOMMENDATION_TEMPLATE.format(
            category_name    = row["category_name"],
            location         = location,
            complaint_count  = int(row["complaint_count"]),
            avg_res_hours    = row["avg_res_hours"],
            appeal_rate_pct  = row["appeal_rate_pct"],
            high_priority_pct= row["high_priority_pct"],
            peak_day         = row["peak_day"],
            peak_month       = row["peak_month"],
            keywords         = ", ".join(keywords) if keywords else "N/A",
            sample_texts     = "\n".join(f"- {t}" for t in sample_texts) if sample_texts else "N/A",
        )

        # Call Groq
        try:
            groq_result = call_groq(prompt)
            logger.info("Groq responded for category=%s location=%s", cat_id, location)
        except Exception as exc:
            logger.error("Groq failed for cat=%s loc=%s: %s", cat_id, location, exc)
            continue

        rec = save_recommendation(db, cat_id, location, row.to_dict(), groq_result, keywords)
        results.append(rec)

    logger.info("Pipeline complete. %d recommendations produced.", len(results))
    return results


# ─────────────────────────────────────────────
# FastAPI Endpoints
# ─────────────────────────────────────────────

@router.post("/api/chat/recommendations", response_model=list[RecommendationOut])
def generate_recommendations(db: Session = Depends(get_db)):
    try:
        return run_recommendation_pipeline(db)
    except Exception as exc:
        logger.exception("Pipeline error")
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/api/manager/recommendations", response_model=list[RecommendationOut])
def list_recommendations(
    status:      Optional[str] = None,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(AiRecommendation)
    if status:
        query = query.filter(AiRecommendation.status == status)
    if category_id:
        query = query.filter(AiRecommendation.category_id == category_id)
    return query.order_by(AiRecommendation.generated_at.desc()).all()


@router.patch("/api/manager/recommendations/{rec_id}", response_model=RecommendationOut)
def update_status(rec_id: int, body: StatusUpdate, db: Session = Depends(get_db)):
    allowed = {"implemented", "ignored"}
    if body.status not in allowed:
        raise HTTPException(status_code=400, detail=f"status must be one of: {allowed}")

    rec = db.query(AiRecommendation).filter(AiRecommendation.id == rec_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    rec.status = body.status
    db.commit()
    db.refresh(rec)
    return rec