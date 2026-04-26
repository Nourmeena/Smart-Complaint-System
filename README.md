# Python AI Recommendation Service

Part of the **Smart Complaint System** — University Complaints Management Platform.

This service is responsible for:
- Analyzing complaint patterns using Pandas statistical analysis
- Extracting recurring themes using TF-IDF
- Generating AI-powered recommendations using Groq LLM
- Storing results in the `ai_recommendations` table

**Person 3 responsibility** — Python Core AI + Database Setup

---

## Project Structure

```
recommendation_service/
├── main.py              # FastAPI app entry point
├── database.py          # SQLAlchemy engine and session setup
├── models.py            # ORM models matching the MySQL schema
├── recommendation.py    # Full pipeline logic + API endpoints
├── translation.py       # Arabic to English translation using Groq
├── requirements.txt     # Python dependencies
├── .env.example         # Environment variables template
└── README.md            # This file
```

---

## Prerequisites

Make sure you have the following installed before starting:

- Python 3.10 or higher
- MySQL 8.0 running locally
- The `complaints_db` database created and seeded with data
- A Groq API key — get one free at [console.groq.com](https://console.groq.com)

---

## Setup Instructions

### 1. Clone the repository and switch to the roqaia branch

```bash
git clone https://github.com/your-team/Smart-Complaint-System.git
cd Smart-Complaint-System
git checkout roqaia
cd recommendation_service
```

### 2. Create a virtual environment

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# Mac / Linux
python -m venv .venv
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/complaints_db
GROQ_API_KEY=gsk_your_actual_groq_api_key_here
RECOMMENDATION_CACHE_HOURS=24
```

> ⚠️ Never commit `.env` to GitHub. It contains your API key and database password.

### 5. Run the database migration

Make sure the `ai_recommendations` table has all required columns. Run this in MySQL Workbench:

```sql
ALTER TABLE ai_recommendations
    ADD COLUMN IF NOT EXISTS root_cause       TEXT         NULL,
    ADD COLUMN IF NOT EXISTS urgency          ENUM('high','medium','low') NULL,
    ADD COLUMN IF NOT EXISTS estimated_impact TEXT         NULL,
    ADD COLUMN IF NOT EXISTS location         VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS complaint_count  INT          NULL,
    ADD COLUMN IF NOT EXISTS avg_resolution_h INT          NULL,
    ADD COLUMN IF NOT EXISTS appeal_rate_pct  INT          NULL,
    ADD COLUMN IF NOT EXISTS top_keywords     VARCHAR(512) NULL,
    ADD COLUMN IF NOT EXISTS generated_at     DATETIME     NULL;
```

### 6. Start the server

```bash
uvicorn main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
```

---

## Testing the API

Once the server is running, open your browser and go to:

```
http://127.0.0.1:8000/docs
```

This opens the Swagger UI where you can test all endpoints interactively.

### Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat/recommendations` | Run the full pipeline and generate recommendations |
| `GET`  | `/api/manager/recommendations` | List all stored recommendations |
| `GET`  | `/api/manager/recommendations?status=pending` | Filter by status |
| `GET`  | `/api/manager/recommendations?category_id=9` | Filter by category |
| `PATCH`| `/api/manager/recommendations/{id}` | Mark as implemented or ignored |
| `GET`  | `/` | Health check |

### Quick Test

**Step 1** — Generate recommendations:
```
POST /api/chat/recommendations
```
Click Execute. This runs the full pipeline.

**Step 2** — View saved recommendations:
```
GET /api/manager/recommendations
```

**Step 3** — Mark one as implemented (replace 1 with actual id):
```
PATCH /api/manager/recommendations/1
Body: { "status": "implemented" }
```

---

## How the Pipeline Works

```
1. Fetch last 200 complaints from MySQL (last 90 days)
        ↓
2. Translate any Arabic complaints to English (Groq)
        ↓
3. Group by category — compute stats per group (Pandas)
   - complaint count, avg resolution time, appeal rate,
     high priority rate, peak day, peak month
        ↓
4. Skip groups with fewer than 5 complaints (not enough signal)
        ↓
5. Check cache — return existing recommendation if < 24 hours old
        ↓
6. Extract top keywords using TF-IDF (Scikit-learn)
        ↓
7. Send stats + keywords + sample texts to Groq LLM
        ↓
8. Parse Groq JSON response
        ↓
9. Save recommendation to ai_recommendations table
        ↓
10. Return all recommendations to Node.js caller
```

---

## Caching

Recommendations are cached for **24 hours** by default.

If you run `POST /api/chat/recommendations` again within 24 hours for the same category, the cached result is returned without calling Groq again.

To change the cache duration, update `RECOMMENDATION_CACHE_HOURS` in your `.env` file.

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Unknown column 'c.created_at'` | Wrong column name | Schema uses `createdAt` not `created_at` — already fixed in code |
| `Invalid API Key 401` | Wrong Groq key | Check `GROQ_API_KEY` in `.env` — no spaces, no quotes |
| `cryptography package required` | Missing dependency | Run `pip install cryptography` |
| `Connection refused` | MySQL not running | Start MySQL from MySQL Workbench |
| Empty response `[]` | No complaints in DB | Need at least 5 complaints in the same category |

---

## Integration with Node.js

This Python service is called internally by the Node.js backend (Person 5).

Node.js calls:
```
POST http://localhost:8000/api/chat/recommendations
```

Make sure both services are running at the same time during development:
- Python service → port `8000`
- Node.js backend → port `3000` (or whatever your team uses)

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | MySQL connection string |
| `GROQ_API_KEY` | Yes | — | Groq API key from console.groq.com |
| `RECOMMENDATION_CACHE_HOURS` | No | `24` | How long before regenerating a recommendation |
