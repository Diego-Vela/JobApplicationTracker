# app/deps.py
from fastapi import Depends, HTTPException, status
from .db import SessionLocal
from sqlalchemy.orm import Session

# Replace these with real JWT auth for production
from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Very simple "user from token" placeholder
def get_current_user_id(token: str = Depends(oauth2_scheme)) -> str:
    # TODO: decode JWT; for now just echo token as user_id (dev-only)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return token
