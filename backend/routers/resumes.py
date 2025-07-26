from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend import schemas, models, crud
from backend.database import SessionLocal

router = APIRouter(prefix="/resumes", tags=["Resumes"])
