# backend/routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from ..deps import get_db, get_current_user_id
from .. import models, schemas

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=schemas.UserOut)
def me(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    user = db.query(models.User).get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return schemas.UserOut(
        user_id=user.user_id, email=user.email, premium=user.premium, created_at=user.created_at
    )

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_me(
    confirm: bool = Query(False, description="Set true to confirm account deletion"),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    if not confirm:
        raise HTTPException(status_code=400, detail="Pass ?confirm=true to delete your account.")

    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        db.delete(user)
        db.commit()   # relies on FK ON DELETE CASCADE / ORM cascade to clean children
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Could not delete user: {e}")
