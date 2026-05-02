from sqlalchemy import create_engine, text
from dotenv import load_dotenv
from embedding import generate_embedding, add_to_index, search_similar
from datetime import datetime
import json
import os

load_dotenv()
SIMILARITY_THRESHOLD=0.85

engine = create_engine(
    f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASS')}@{os.getenv('DB_HOST')}/{os.getenv('DB_NAME')}"
)

def get_categories(faculty_id: int):

    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT c.id, c.name, c.description,
                   GROUP_CONCAT(ck.keyword SEPARATOR ', ') as keywords
            FROM Categories c
            LEFT JOIN CategoryKeywords ck ON ck.category_id = c.id
            WHERE c.faculty_id = :fid AND c.is_active = 1 AND c.deleted_at IS NULL
            GROUP BY c.id, c.name, c.description
        """), {"fid": faculty_id})

        categories = []
        for row in result.mappings():
            categories.append({
                "id": row["id"],
                "name": row["name"],
                "description": row["description"],
                "keywords": row["keywords"] if row["keywords"] else ""
            })
        return categories


    
def get_priority_rules():
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT priority_level, description, examples
            FROM PriorityRules
            ORDER BY priority_level DESC
        """))
        rules = []
        for row in result.mappings():
            rules.append({
                "level": row["priority_level"],
                "description": row["description"],
                "examples": row["examples"]
            })
        return rules
    
    




def load_embeddings_from_db():
    # Called once at startup — loads all embeddings into FAISS
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT id, embedding FROM Complaints
            WHERE embedding IS NOT NULL AND deleted_at IS NULL
        """))
        complaints = []
        for row in result.mappings():
            try:
                embedding = json.loads(row["embedding"])
                complaints.append({"id": row["id"], "embedding": embedding})
            except:
                pass
        return complaints
    

def get_candidate_ids(user_id: int, category_id: int, status_filter: list):
    # Step 1 of hybrid search — get complaint ids filtered by user+category from MySQL
    placeholders = ",".join([f"'{s}'" for s in status_filter])
    with engine.connect() as conn:
        result = conn.execute(text(f"""
            SELECT id FROM Complaints
            WHERE user_id = :user_id
            AND category_id = :category_id
            AND status IN ({placeholders})
            AND deleted_at IS NULL
        """), {"user_id": user_id, "category_id": category_id})
        return [row["id"] for row in result.mappings()]
    
def get_complaint_by_id(complaint_id: int):
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT id, status, ai_summary, resolution_text, resolved_at
            FROM Complaints WHERE id = :id
        """), {"id": complaint_id})
        row = result.mappings().fetchone()
        return dict(row) if row else None
    
def check_duplicate(user_id: int, category_id: int, problem: str):
    # Hybrid: MySQL filters by user+category+status, FAISS finds semantically similar
    
    candidate_ids = get_candidate_ids(user_id, category_id, ["pending", "in_progress"])
    print("CANDIDATES:", candidate_ids)
    if not candidate_ids:
        return None
    embedding = generate_embedding(problem)
    results = search_similar(embedding, candidate_ids)
    for cid, score in results:
        existing = get_complaint_by_id(cid)

        if score >= SIMILARITY_THRESHOLD:
            print(f"DUPLICATE FOUND: #{cid} score={score}")
            return existing
    return None


def check_resolved(user_id: int, category_id: int, problem: str):
    # Same hybrid approach but for resolved complaints
    candidate_ids = get_candidate_ids(user_id, category_id, ["resolved"])
    if not candidate_ids:
        return None
    embedding = generate_embedding(problem)
    results = search_similar(embedding, candidate_ids)
    if results:
        complaint_id, score = results[0]
        print(f"RESOLVED MATCH: complaint #{complaint_id} similarity={score:.3f}")
        return get_complaint_by_id(complaint_id)
    return None


def save_complaint(user_id: int, category_id: int, problem: str, location: str, since: str, ai_summary: str, priority: int):
    embedding = generate_embedding(problem or "")
    embedding_json = json.dumps(embedding.tolist())
    with engine.connect() as conn:
        result = conn.execute(text("""
            INSERT INTO Complaints (user_id, category_id, problem, location, since, ai_summary, priority, status, embedding, createdAt, updatedAt)
            VALUES (:user_id, :category_id, :problem, :location, :since, :ai_summary, :priority, 'pending', :embedding, :now, :now)
        """), {
            "user_id": user_id,
            "category_id": category_id,
            "problem": problem,
            "location": location,
            "since": since,
            "ai_summary": ai_summary,
            "priority": priority,
            "embedding": embedding_json,
            "now": datetime.now()
        })
        conn.commit()
        new_id = result.lastrowid
        # Add to FAISS live so next request sees it immediately
        add_to_index(new_id, embedding)
        return new_id

def add_complaint_history(complaint_id: int, status: str, changed_by: int):
    from datetime import datetime
    with engine.connect() as conn:
        conn.execute(text("""
            INSERT INTO ComplaintHistories (complaint_id, status, changed_by, changed_at)
            VALUES (:cid, :status, :by, :time)
        """), {
            "cid": complaint_id,
            "status": status,
            "by": changed_by,
            "time": datetime.now()
        })
        conn.commit()


def get_officers_by_category(category_id: int):
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT u.id, u.full_name, u.email
            FROM CategoryOfficers co
            JOIN users u ON u.id = co.officer_id
            WHERE co.category_id = :cid
        """), {"cid": category_id})

        return [dict(row) for row in result.mappings()]