# app/routers/applications.py
from fastapi import APIRouter, Depends, HTTPException, Request, Query, status
from sqlalchemy.orm import Session
from ..deps import get_db
from .. import models, schemas

router = APIRouter(prefix="/applications", tags=["applications"])

ALLOWED_STATUSES = {"applied", "interviewing", "offer", "rejected"}

def _uid(request: Request) -> str:
    uid = getattr(request.state, "user_id", None)
    if not uid:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return uid

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

@router.get("")
def list_applications(request: Request, db: Session = Depends(get_db)):
    user_id = _uid(request)
    return (
        db.query(models.Application)
        .filter(models.Application.user_id == user_id)
        .order_by(models.Application.created_at.desc())
        .all()
    )

@router.post("", status_code=201)
def create_application(
    payload: schemas.ApplicationCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    user_id = _uid(request)
    app = models.Application(user_id=user_id, **payload.dict())
    db.add(app)
    db.commit()
    db.refresh(app)
    return app

@router.get("/{application_id}")
def get_application(application_id: str, request: Request, db: Session = Depends(get_db)):
    user_id = _uid(request)
    return _get_owned_app(db, user_id, application_id)

@router.patch("/{application_id}")
def update_application(
    application_id: str,
    patch: schemas.ApplicationUpdate,
    request: Request,
    db: Session = Depends(get_db),
):
    user_id = _uid(request)
    app = _get_owned_app(db, user_id, application_id)
    data = patch.dict(exclude_unset=True)
    for k, v in data.items():
        setattr(app, k, v)
    db.commit()
    db.refresh(app)
    return app

@router.post("/{application_id}/move", status_code=204)
def move_status(
    application_id: str,
    request: Request,
    db: Session = Depends(get_db),
    new_status: str = Query(..., description="New status value"),
):
    user_id = _uid(request)
    if new_status not in ALLOWED_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")

    app = _get_owned_app(db, user_id, application_id)
    app.status = new_status
    db.commit()
    return None

@router.delete("/{application_id}", status_code=204)
def delete_application(application_id: str, request: Request, db: Session = Depends(get_db)):
    user_id = _uid(request)
    app = _get_owned_app(db, user_id, application_id)
    db.delete(app)
    db.commit()
    return None
