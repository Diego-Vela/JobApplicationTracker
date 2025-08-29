# app/routers/users.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..deps import get_db, get_current_user_id
from .. import models, schemas

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=schemas.UserOut)
def me(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    user = db.query(models.User).get(user_id)
    return schemas.UserOut(
        user_id=user.user_id, email=user.email, premium=user.premium, created_at=user.created_at
    )
