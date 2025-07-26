from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP, func, Date
from sqlalchemy.orm import relationship
from backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(Text, unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    applications = relationship("Application", back_populates="user", cascade="all, delete")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(Text, nullable=False)
    file_path = Column(Text, nullable=False)  # e.g., local path or S3 URL
    label = Column(Text)
    uploaded_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    applications = relationship("Application", back_populates="resume")  # one-to-many
    


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True)

    company_name = Column(Text, nullable=False)
    job_title = Column(Text, nullable=False)
    job_description = Column(Text, nullable=True) # Optional field for job description <MAX CHARACTERS = 10,000>
    status = Column(Text, nullable=False)  # e.g., "applied", "interviewing", "rejected"
    applied_date = Column(Date, server_default=func.current_date())

    user = relationship("User", back_populates="applications")
    resume = relationship("Resume", back_populates="applications")
