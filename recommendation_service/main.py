"""
main.py
=======
FastAPI app entry point.
Run with: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI
from database import create_tables
from recommendation import router as recommendation_router

app = FastAPI(title="Complaints AI Service")

# Register all routes
app.include_router(recommendation_router)

@app.on_event("startup")
def startup():
    create_tables()

@app.get("/")
def health_check():
    return {"status": "running", "service": "Complaints AI Service"}