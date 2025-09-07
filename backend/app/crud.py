from sqlalchemy.orm import Session
from fastapi import HTTPException
from app import models, schemas

# ----- Users -----
# Gets the Information for a user by their email
def get_user_by_email(db: Session, email: str):
  return db.query(models.User).filter(models.User.email == email).first()

# Create a user using the provided schema
def create_user(db: Session, user: schemas.UserCreate):
  db_user = models.User(email=user.email, password_hash=user.password) # Hash at some point
  db.add(db_user)
  db.commit()
  db.refresh(db_user)
  return db_user

# Deletes a user by email
def delete_user(db: Session, email: str):
  db_user = get_user_by_email(db, email)
  if db_user:
    db.delete(db_user)
    db.commit()
    return db_user
  else:
    raise HTTPException(status_code=404, detail="User not found")
  return None

# ----- Applications -----
# Creates an application
def create_application(db: Session, application: schemas.ApplicationCreate):
  # Check that the user exists
  db_user = db.query(models.User).filter(models.User.id == application.user_id).first()
  if not db_user:
    raise HTTPException(status_code=404, detail="User not found")
  db_app = models.Application(**application.model_dump())
  db.add(db_app)
  db.commit()
  db.refresh(db_app)
  return db_app

def get_applications_for_user(db: Session, user_id: int):
  return db.query(models.Application).filter(models.Application.user_id == user_id).all()

def delete_application(db: Session, application_id: int):
  db_app = db.query(models.Application).filter(models.Application.id == application_id).first()
  if db_app:
    db.delete(db_app)
    db.commit()
    return db_app
  else:
    raise HTTPException(status_code=404, detail="Application not found")
  return None 
