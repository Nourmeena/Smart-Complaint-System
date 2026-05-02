# 🤖 Smart Complaint System — AI Chat Service

## 📌 Overview

This service is the **AI-powered chat module** of the Smart Complaint System.
It allows students to submit structured complaints through a conversational interface powered by LLMs.

The system intelligently:

- Understands user intent
- Extracts complaint details
- Detects missing information
- Classifies complaints into categories
- Assigns priority
- Detects duplicates
- Routes complaints to the responsible department

---

## 🧠 Features

### 💬 Conversational Complaint Submission

- Accepts free-text complaints
- Supports **Arabic & English**
- Maintains conversation state across multiple turns

---

### 🧩 Intelligent Processing

- Intent detection: `complaint / question / irrelevant`
- Dynamic field extraction:
  - problem
  - location (if required)
  - since (if required)

- Missing information detection

---

### 🗂️ Category Classification

- Fully dynamic categories loaded from database
- Uses:
  - category name
  - description
  - keywords

---

### ⚡ Priority Assignment

- Based on configurable rules from DB
- Levels: 1 → 5

---

### 🧾 AI Summary

- Generates professional structured summary
- No hallucination (strict extraction-based)

---

### 🔁 Duplicate Detection (Advanced)

- Uses **semantic similarity (embeddings)**
- Hybrid approach:
  - MySQL filtering (user + category)
  - Vector similarity (FAISS-like logic)

---

### 📦 Complaint Storage

- Saves:
  - raw problem
  - structured data
  - AI summary
  - priority
  - embedding vector

---

### 🔀 Routing System

- Automatically assigns complaint to responsible officers
- Based on `category_officers` table

---

### 🕓 Complaint History Tracking

- Every status change is logged in `ComplaintHistory`

---

## 🏗️ Project Structure

```
backend-ai/
│
├── chat_service/
│   ├── main.py              # FastAPI entry point
│   ├── database.py          # DB operations
│   ├── embedding.py         # Semantic similarity
│   ├── prompts.txt          # AI system prompt
│
├── .env
├── requirements.txt
```

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone <repo-url>
cd backend-ai
```

---

### 2. Create virtual environment

```bash
python -m venv venv
venv\Scripts\activate   # Windows
```

---

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

---

### 4. Setup environment variables

Create `.env` file:

```env
GROQ_API_KEY=your_api_key

DB_HOST=127.0.0.1
DB_USER=root
DB_PASS=your_password
DB_NAME=smart_complaint
```

---

### 5. Run the server

```bash
uvicorn chat_service.main:app --reload
```

---

## 🚀 API Usage

### 📩 Send Message

```http
POST /api/chat/message
```

### Request:

```json
{
  "message": "فيه ميه بتنزل من السقف",
  "user_id": 1,
  "faculty_id": 1,
  "conversation_state": {}
}
```

---

### Response Example:

```json
{
  "intent": "complaint",
  "reply": "تم تسجيل شكواك...",
  "category_id": 1,
  "category_name": "Maintenance",
  "complaint_data": {
    "problem": "...",
    "location": "...",
    "since": "..."
  },
  "ai_summary": "...",
  "priority": 4,
  "missing_fields": [],
  "conversation_state": {},
  "complaint_id": 59,
  "routing_status": "assigned"
}
```

---

## 🔄 Conversation Flow

1. User sends message
2. AI detects intent
3. Extracts available data
4. Requests missing fields (if any)
5. Classifies category
6. Assigns priority
7. Checks duplicates
8. Saves complaint
9. Routes to officer

---

## 🔗 Integration Notes (Frontend)

- Use `conversation_state` to maintain chat flow
- Display `reply` directly in chat UI
- Redirect user using `complaint_id`
- Handle:
  - duplicate
  - already_resolved
  - missing_fields

---

## 🧠 Tech Stack

- FastAPI
- Groq LLM API
- Sentence Transformers
- MySQL
- SQLAlchemy

---

## 📌 Future Improvements

- Real-time notifications
- WebSocket integration
- Advanced analytics
- Role-based dashboards
- Feedback loop for AI improvement

---

## 👨‍💻 Author

AI Chat Service developed as part of the Smart Complaint System Graduation Project.
