"""
models.py
=========
SQLAlchemy ORM models matching the actual database schema.
All column names match exactly what's in the MySQL database.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Faculty(Base):
    __tablename__ = "faculties"

    id           = Column(Integer, primary_key=True)
    name         = Column(String(255), nullable=True)
    email_domain = Column(String(255), nullable=True)
    createdAt    = Column(DateTime, nullable=False)
    updatedAt    = Column(DateTime, nullable=False)

    categories   = relationship("Category", back_populates="faculty")


class Category(Base):
    __tablename__ = "categories"

    id          = Column(Integer, primary_key=True)
    faculty_id  = Column(Integer, ForeignKey("faculties.id"), nullable=False)
    name        = Column(String(255), nullable=True)
    description = Column(String(255), nullable=True)
    sla_hours   = Column(Integer, nullable=True)
    is_active   = Column(Integer, nullable=True)
    createdAt   = Column(DateTime, nullable=False)
    updatedAt   = Column(DateTime, nullable=False)
    deleted_at  = Column(DateTime, nullable=True)

    faculty          = relationship("Faculty", back_populates="categories")
    complaints       = relationship("Complaint", back_populates="category")
    recommendations  = relationship("AiRecommendation", back_populates="category")
    analysis_reports = relationship("AnalysisReport", back_populates="category")
    keywords         = relationship("CategoryKeyword", back_populates="category")


class CategoryKeyword(Base):
    __tablename__ = "categorykeywords"

    id          = Column(Integer, primary_key=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    keyword     = Column(String(255), nullable=True)

    category    = relationship("Category", back_populates="keywords")


class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True)
    student_id    = Column(Integer, nullable=True)
    full_name     = Column(String(255), nullable=True)
    email         = Column(String(255), nullable=True)
    password_hash = Column(String(255), nullable=True)
    role          = Column(SAEnum("student", "officer", "manager", "admin"), nullable=False)
    is_active     = Column(Integer, nullable=True)
    createdAt     = Column(DateTime, nullable=False)
    updatedAt     = Column(DateTime, nullable=False)
    deletedAt     = Column(DateTime, nullable=True)

    complaints    = relationship("Complaint", back_populates="user")


class Complaint(Base):
    __tablename__ = "complaints"

    id              = Column(Integer, primary_key=True)
    user_id         = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id     = Column(Integer, ForeignKey("categories.id"), nullable=False)
    problem         = Column(Text, nullable=True)
    location        = Column(String(255), nullable=True)
    since           = Column(DateTime, nullable=True)
    ai_summary      = Column(Text, nullable=True)
    priority        = Column(Integer, nullable=True)
    status          = Column(SAEnum("pending", "in_progress", "resolved", "appealed"), nullable=True)
    resolution_text = Column(Text, nullable=True)
    resolved_at     = Column(DateTime, nullable=True)
    sla_deadline    = Column(DateTime, nullable=True)
    createdAt       = Column(DateTime, nullable=False)
    updatedAt       = Column(DateTime, nullable=False)

    user            = relationship("User", back_populates="complaints")
    category        = relationship("Category", back_populates="complaints")
    appeals         = relationship("Appeal", back_populates="complaint")


class Appeal(Base):
    __tablename__ = "appeals"

    id            = Column(Integer, primary_key=True)
    complaint_id  = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    responded_by  = Column(Integer, nullable=True)
    reason        = Column(Text, nullable=True)
    status        = Column(SAEnum("pending", "reviewed"), nullable=True)
    response_text = Column(Text, nullable=True)
    responded_at  = Column(DateTime, nullable=True)
    createdAt     = Column(DateTime, nullable=False)
    updatedAt     = Column(DateTime, nullable=False)

    complaint     = relationship("Complaint", back_populates="appeals")


class AiRecommendation(Base):
    """
    Maps to ai_recommendations table (the one with full columns).
    NOT airecommendations which is the old Sequelize one.
    """
    __tablename__ = "ai_recommendations"

    id               = Column(Integer, primary_key=True, autoincrement=True)
    category_id      = Column(Integer, ForeignKey("categories.id"), nullable=False)
    pattern_detected = Column(Text, nullable=False)
    recommendation   = Column(Text, nullable=False)
    root_cause       = Column(Text, nullable=True)
    urgency          = Column(SAEnum("high", "medium", "low"), nullable=True)
    estimated_impact = Column(Text, nullable=True)
    location         = Column(String(255), nullable=True)
    complaint_count  = Column(Integer, nullable=True)
    avg_resolution_h = Column(Integer, nullable=True)
    appeal_rate_pct  = Column(Integer, nullable=True)
    top_keywords     = Column(String(512), nullable=True)
    status           = Column(SAEnum("pending", "implemented", "ignored"), nullable=True)
    generated_at     = Column(DateTime, nullable=True, default=datetime.utcnow)

    category         = relationship("Category", back_populates="recommendations")


class AnalysisReport(Base):
    __tablename__ = "analysis_reports"

    id           = Column(Integer, primary_key=True, autoincrement=True)
    category_id  = Column(Integer, ForeignKey("categories.id"), nullable=False)
    top_issues   = Column(Text, nullable=True)
    generated_at = Column(DateTime, nullable=True, default=datetime.utcnow)

    category     = relationship("Category", back_populates="analysis_reports")