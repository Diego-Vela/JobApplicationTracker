# backend/schemas.py
from typing import Optional, List, Literal
from datetime import date, datetime
from pydantic import BaseModel, EmailStr, conlist, Field
from uuid import UUID

# ---------- Auth ----------
class SignUpIn(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

# ---------- User ----------
class UserOut(BaseModel):
    user_id: str
    email: EmailStr
    premium: bool
    created_at: datetime

# ---------- Files ----------
class FileMetaIn(BaseModel):
    file_name: str
    url: str
    label: Optional[str] = None

class ResumeOut(BaseModel):
    resume_id: str
    file_name: str
    label: Optional[str]
    resume_url: str
    uploaded_at: datetime

class CVOut(BaseModel):
    cv_id: str
    file_name: str
    label: Optional[str]
    cv_url: str
    uploaded_at: datetime

# ---------- Applications ----------
class ApplicationCreate(BaseModel):
    company: str
    job_title: Optional[str] = None
    job_description: Optional[str] = None
    job_website: Optional[str] = None
    status: Optional[str] = "applied"
    applied_date: Optional[date] = None
    resume_id: Optional[str] = None
    cv_id: Optional[str] = None

class ApplicationUpdate(BaseModel):
    company: Optional[str] = None
    job_title: Optional[str] = None
    job_description: Optional[str] = None
    job_website: Optional[str] = None
    status: Optional[str] = None
    applied_date: Optional[date] = None
    resume_id: Optional[str] = None
    cv_id: Optional[str] = None

class ApplicationOut(BaseModel):
    application_id: str
    company: str
    job_title: Optional[str]
    job_description: Optional[str]
    job_website: Optional[str]
    status: str
    applied_date: Optional[date]
    created_at: datetime
    resume_id: Optional[str]
    cv_id: Optional[str]

class BulkMoveIn(BaseModel):
    ids: List[UUID] = Field(..., min_items=1, max_items=200)
    status: Literal["applied", "interviewing", "offer", "rejected"]

class BulkDeleteIn(BaseModel):
    ids: List[UUID] = Field(..., min_items=1, max_items=200)

# ---------- Notes ----------
class NoteCreate(BaseModel):
    content: str

class NoteOut(BaseModel):
    note_id: str
    application_id: str
    content: str
    created_at: datetime
