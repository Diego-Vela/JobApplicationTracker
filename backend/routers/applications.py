# app/routers/applications.py
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc, or_
from typing import Optional, Literal

from ..deps import get_db, get_current_user_id
from .. import models, schemas

def clamp(value, min_value, max_value):
    return max(min_value, min(value, max_value))

router = APIRouter(prefix="/applications", tags=["applications"])

ALLOWED_STATUSES = {"applied", "interviewing", "offer", "rejected"}


def _get_owned_app(db: Session, user_id: str, application_id: str) -> models.Application:
    app = (
        db.query(models.Application)
        .filter(
            models.Application.application_id == application_id,
            models.Application.user_id == user_id,
        )
        .first()
    )
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app


@router.get("", response_model=list[schemas.ApplicationOut])
def list_applications(
    current_user: models.User = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    q: str | None = Query(None, description="search company/title/description"),
    status_eq: str | None = Query(None),
    sort_by: Literal["created_at","applied_date","company","status"] = "applied_date",
    order: Literal["asc","desc"] = "desc",
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    from sqlalchemy import asc, desc, or_

    query = (
        db.query(models.Application)
        .filter(models.Application.user_id == current_user.user_id)  # <-- use .user_id
    )

    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(
                models.Application.company.ilike(like),
                models.Application.job_title.ilike(like),
                models.Application.job_description.ilike(like),
            )
        )

    if status_eq and status_eq != "all":
        query = query.filter(models.Application.status == status_eq)

    col = getattr(models.Application, sort_by)
    query = query.order_by(asc(col) if order == "asc" else desc(col))

    return query.offset(offset).limit(limit).all()


@router.post("", status_code=201)
def create_application(
    payload: schemas.ApplicationCreate,
    current_user: models.User = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    app = models.Application(user_id=current_user.user_id, **payload.model_dump())
    db.add(app)
    db.commit()
    db.refresh(app)
    return app


@router.get("/{application_id}")
def get_application(
    application_id: str,
    current_user: models.User = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return _get_owned_app(db, current_user.user_id, application_id)


@router.patch("/{application_id}")
def update_application(
    application_id: str,
    patch: schemas.ApplicationUpdate,
    current_user: models.User = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    app = _get_owned_app(db, current_user.user_id, application_id)

    data = patch.dict(exclude_unset=True)
    for k, v in data.items():
        setattr(app, k, v)

    db.commit()
    db.refresh(app)
    return app


@router.post("/{application_id}/move", status_code=204)
def move_status(
    application_id: str,
    current_user: models.User = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    new_status: str = Query(..., description="New status value"),
):
    if new_status not in ALLOWED_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")

    app = _get_owned_app(db, current_user.user_id, application_id)
    app.status = new_status
    db.commit()
    return None


@router.delete("/{application_id}", status_code=204)
def delete_application(
    application_id: str,
    current_user: models.User = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    app = _get_owned_app(db, current_user.user_id, application_id)
    db.delete(app)
    db.commit()
    return None

@router.post("/bulk-move")
def bulk_move(
    payload: schemas.BulkMoveIn,
    current_user: models.User = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    # Only update owned applications
    q = db.query(models.Application).filter(
        models.Application.user_id == current_user.user_id,
        models.Application.application_id.in_(payload.ids),
    )
    updated = q.update({"status": payload.status}, synchronize_session=False)
    db.commit()
    return {
        "requested_count": len(payload.ids),
        "updated_count": updated,
    }


@router.post("/bulk-delete")
def bulk_delete(
    payload: schemas.BulkDeleteIn,
    current_user: models.User = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    q = db.query(models.Application).filter(
        models.Application.user_id == current_user.user_id,
        models.Application.application_id.in_(payload.ids),
    )
    deleted = q.delete(synchronize_session=False)
    db.commit()
    return {
        "requested_count": len(payload.ids),
        "deleted_count": deleted,
    }