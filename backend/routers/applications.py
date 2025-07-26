from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend import schemas, models, crud
from backend.database import SessionLocal

router = APIRouter(prefix="/applications", tags=["Applications"])

# Dependency to get the database session
def get_db():
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()

@router.post("/", response_model=schemas.ApplicationResponse)
def create_application(application: schemas.ApplicationCreate, db: Session = Depends(get_db)):
  return crud.create_application(db=db, application=application)

@router.get("/{user_id}", response_model=list[schemas.ApplicationResponse])
def get_applications_for_user(user_id: int, db: Session = Depends(get_db)):
  return crud.get_applications_for_user(db=db, user_id=user_id)

@router.delete("/{application_id}")
def delete_application(application_id: int, db: Session = Depends(get_db)):
  return crud.delete_application(db=db, application_id=application_id)