# backend/routers/auth.py
import os
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from jose import jwt
from ..deps import get_db
from .. import models, schemas
from passlib.hash import bcrypt  # or swap to argon2 later

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
ALGORITHM  = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=schemas.UserOut, status_code=201)
def signup(payload: schemas.SignUpIn, db: Session = Depends(get_db)):
    user = models.User(email=payload.email, password_hash=bcrypt.hash(payload.password))
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Email already registered")
    return user

def create_access_token(sub: str, minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES) -> str:
    exp = int((datetime.utcnow() + timedelta(minutes=minutes)).timestamp())
    payload = {"sub": sub, "exp": exp}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/login", response_model=schemas.TokenOut)
def login(payload: schemas.SignUpIn, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not bcrypt.verify(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return schemas.TokenOut(access_token=create_access_token(user.user_id))
