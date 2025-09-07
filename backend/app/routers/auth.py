# backend/routers/auth.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.deps import get_db, get_current_user_id
from app import schemas, models

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/me", response_model=schemas.UserOut)
def me(
    current_user: models.User = Depends(get_current_user_id),
):
    """Return the currently authenticated Cognito user from the DB."""
    return current_user
