from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date, datetime


# ----------- User -----------

class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True


# ----------- Resume -----------

class ResumeBase(BaseModel):
    file_name: str
    file_path: str
    label: Optional[str] = None


class ResumeCreate(ResumeBase):
    user_id: int


class ResumeResponse(ResumeBase):
    id: int
    uploaded_at: datetime

    class Config:
        orm_mode = True


# ----------- Application -----------

class ApplicationBase(BaseModel):
    company_name: str
    job_title: Optional[str] = Field('Employee')
    job_description: Optional[str] = Field(None, max_length=10000)  # Optional field for job description <MAX CHARACTERS = 10,000>
    status: Optional[str] = Field('applied')  # ALERT!!!! CHANGE TO ENUM LATER


class ApplicationCreate(ApplicationBase):
    user_id: int
    resume_id: Optional[int] = None

class ApplicationResponse(ApplicationBase):
    id: int
    applied_date: Optional[date]
    resume: Optional[ResumeResponse] = None

    class Config:
        orm_mode = True
