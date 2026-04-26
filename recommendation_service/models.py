"""
models.py
=========
SQLAlchemy ORM models mapping to your MySQL tables.
Only the tables that the Python service reads or writes are defined here.
The full schema is in migration_ai_recommendations.sql.
"""

from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey,
    Enum as SAEnum
)
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Category(Base):
    """
    Read-only from Python side.
    Python reads categories to detect which department a complaint belongs to.
    """
    __tablename__ = "categories"

    id             = Column(Integer, primary_key=True)
    name           = Column(String(255), nullable=False)
    keywords       = Column(Text, nullable=True)
    responsible_id = Column(Integer, nullable=True)
    sla_hours      = Column(Integer, nullable=True)

    # Relationship — lets you do category.complaints in Python
    complaints     = relationship("Complaint", back_populates="category")
    recommendations= relationship("AiRecommendation", back_populates="category")
    analysis_reports = relationship("AnalysisReport", back_populates="category")


class Complaint(Base):
    """
    Read-only from Python side.
    Python fetches complaints to run the recommendation pipeline.
    """
    __tablename__ = "complaints"

    id              = Column(Integer, primary_key=True)
    problem         = Column(Text, nullable=False)
    ai_summary      = Column(Text, nullable=True)
    priority        = Column(Integer, nullable=True)
    status          = Column(String(50), nullable=True)
    resolution_text = Column(Text, nullable=True)
    location        = Column(String(255), nullable=True)
    category_id     = Column(Integer, ForeignKey("categories.id"), nullable=False)
    created_at      = Column(DateTime, nullable=True)
    resolved_at     = Column(DateTime, nullable=True)

    category        = relationship("Category", back_populates="complaints")
    appeals         = relationship("Appeal", back_populates="complaint")


class Appeal(Base):
    """
    Read-only from Python side.
    Used to calculate appeal rate per complaint group.
    """
    __tablename__ = "appeals"

    id           = Column(Integer, primary_key=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    reason       = Column(Text, nullable=True)
    status       = Column(String(50), nullable=True)

    complaint    = relationship("Complaint", back_populates="appeals")


class AiRecommendation(Base):
    """
    Written by Python after running the recommendation pipeline.
    Node.js reads this table to return results to the frontend.
    """
    __tablename__ = "ai_recommendations"

    id               = Column(Integer, primary_key=True, autoincrement=True)
    category_id      = Column(Integer, ForeignKey("categories.id"), nullable=False)
    pattern_detected = Column(Text,    nullable=False)
    recommendation   = Column(Text,    nullable=False)
    root_cause       = Column(Text,    nullable=True)
    urgency          = Column(SAEnum("high", "medium", "low"), default="medium")
    estimated_impact = Column(Text,    nullable=True)
    location         = Column(String(255), nullable=True)
    complaint_count  = Column(Integer, nullable=True)
    avg_resolution_h = Column(Integer, nullable=True)
    appeal_rate_pct  = Column(Integer, nullable=True)
    top_keywords     = Column(String(512), nullable=True)
    status           = Column(SAEnum("pending", "implemented", "ignored"), default="pending")
    generated_at     = Column(DateTime, default=datetime.utcnow)

    category         = relationship("Category", back_populates="recommendations")


class AnalysisReport(Base):
    """
    Written by Python after running the analysis (K-Means) pipeline.
    Stores cached top issues per category.
    """
    __tablename__ = "analysis_reports"

    id           = Column(Integer, primary_key=True, autoincrement=True)
    category_id  = Column(Integer, ForeignKey("categories.id"), nullable=False)
    top_issues   = Column(Text, nullable=True)   # stored as JSON string
    generated_at = Column(DateTime, default=datetime.utcnow)

    category     = relationship("Category", back_populates="analysis_reports")