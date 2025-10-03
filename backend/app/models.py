# /models.py
import uuid
from sqlalchemy import Column, Boolean, Text, DateTime, ForeignKey, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db import Base

def uuid_pk():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    user_id   = Column(UUID(as_uuid=False), primary_key=True, default=uuid_pk)
    email     = Column(Text, unique=True, nullable=False)
    premium   = Column(Boolean, default=False)
    created_at= Column(DateTime(timezone=True), server_default=func.now())
    cognito_sub = Column(Text, unique=True, nullable=True)

    applications = relationship("Application", back_populates="user", cascade="all, delete")

class Resume(Base):
    __tablename__ = "resumes"
    resume_id  = Column(UUID(as_uuid=False), primary_key=True, default=uuid_pk)
    user_id    = Column(UUID(as_uuid=False), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    resume_url = Column(Text, nullable=False)
    file_name  = Column(Text, nullable=False)
    label      = Column(Text)
    uploaded_at= Column(DateTime(timezone=True), server_default=func.now())

    applications = relationship(
        "Application",
        primaryjoin="Application.resume_id==Resume.resume_id",
        back_populates="resume",
        passive_deletes=True,
    )

class CV(Base):
    __tablename__ = "cv"
    cv_id      = Column(UUID(as_uuid=False), primary_key=True, default=uuid_pk)
    user_id    = Column(UUID(as_uuid=False), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    cv_url     = Column(Text, nullable=False)
    file_name  = Column(Text, nullable=False)
    label      = Column(Text)
    uploaded_at= Column(DateTime(timezone=True), server_default=func.now())

    applications = relationship(
        "Application",
        primaryjoin="Application.cv_id==CV.cv_id",
        back_populates="cv",
        passive_deletes=True,
    )

class Application(Base):
    __tablename__ = "application"
    application_id = Column(UUID(as_uuid=False), primary_key=True, default=uuid_pk)  
    user_id       = Column(UUID(as_uuid=False), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    resume_id     = Column(UUID(as_uuid=False), ForeignKey("resumes.resume_id", ondelete="SET NULL"), nullable=True)
    cv_id         = Column(UUID(as_uuid=False), ForeignKey("cv.cv_id", ondelete="SET NULL"), nullable=True)
    company       = Column(Text, nullable=False)
    job_title     = Column(Text)
    job_description = Column(Text)
    job_website   = Column(Text)
    status        = Column(Text, default="applied")
    applied_date  = Column(Date)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="applications")
    notes = relationship("ApplicationNote", back_populates="application", cascade="all, delete")
    resume = relationship("Resume", back_populates="applications")
    cv     = relationship("CV",     back_populates="applications")
    

class ApplicationNote(Base):
    __tablename__ = "application_notes"
    note_id       = Column(UUID(as_uuid=False), primary_key=True, default=uuid_pk)
    application_id = Column(UUID(as_uuid=False), ForeignKey("application.application_id", ondelete="CASCADE"), nullable=False)
    user_id       = Column(UUID(as_uuid=False), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    content       = Column(Text, nullable=False)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())

    application   = relationship("Application", back_populates="notes")
