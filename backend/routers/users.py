from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend import schemas, models, crud
from backend.database import SessionLocal

router = APIRouter(prefix="/users", tags=["Users"])

# Dependency to get the database session
def get_db():
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()

@router.post("/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
  db_user = crud.get_user_by_email(db, email=user.email)
  if db_user:
    raise HTTPException(status_code=400, detail="Email already registered")
  return crud.create_user(db=db, user=user)

@router.delete("/{user_id}")
def delete_user(email: str, db: Session = Depends(get_db)):
  return crud.delete_user(db, email=email)