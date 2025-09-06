# backend/routers/auth.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..deps import get_db, get_current_user_id
from .. import models, schemas

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/me", response_model=schemas.UserOut)
def me(
    current_user: models.User = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Return the currently authenticated Cognito user from the DB."""
    return current_user
