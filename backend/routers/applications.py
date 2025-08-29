# app/routers/applications.py
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc
from typing import Optional, Literal
from ..deps import get_db, get_current_user_id
from .. import models, schemas

router = APIRouter(prefix="/applications", tags=["applications"])

@router.post("", response_model=schemas.ApplicationOut, status_code=201)
def create_application(payload: schemas.ApplicationCreate, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    app = models.Application(
        user_id=user_id,
        company=payload.company,
        job_title=payload.job_title,
        job_description=payload.job_description,
        status=payload.status or "applied",
        applied_date=payload.applied_date,
        resume_id=payload.resume_id,
        cv_id=payload.cv_id,
    )
    db.add(app); db.commit(); db.refresh(app)
    return app  # pydantic will coerce via response_model

@router.get("", response_model=list[schemas.ApplicationOut])
def list_applications(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    q: Optional[str] = Query(None, description="search company/title/description"),
    status_eq: Optional[str] = Query(None),
    sort_by: Optional[Literal["created_at","applied_date","company","status"]] = "created_at",
    order: Optional[Literal["asc","desc"]] = "desc",
    limit: int = 50,
    offset: int = 0,
):
    query = db.query(models.Application).filter(models.Application.user_id == user_id)
    if q:
        like = f"%{q}%"
        query = query.filter(
            (models.Application.company.ilike(like)) |
            (models.Application.job_title.ilike(like)) |
            (models.Application.job_description.ilike(like))
        )
    if status_eq:
        query = query.filter(models.Application.status == status_eq)

    col = getattr(models.Application, sort_by or "created_at")
    query = query.order_by(asc(col) if order == "asc" else desc(col))

    rows = query.offset(offset).limit(limit).all()
    return rows

@router.get("/{application_id}", response_model=schemas.ApplicationOut)
def get_application(application_id: str, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    app = db.query(models.Application).filter(models.Application.application_id == application_id, models.Application.user_id == user_id).first()
    if not app: raise HTTPException(404, "Application not found")
    return app

@router.patch("/{application_id}", response_model=schemas.ApplicationOut)
def update_application(application_id: str, payload: schemas.ApplicationUpdate, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    app = db.query(models.Application).filter(models.Application.application_id == application_id, models.Application.user_id == user_id).first()
    if not app: raise HTTPException(404, "Application not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(app, field, value)
    db.commit(); db.refresh(app)
    return app

@router.post("/{application_id}/move", response_model=schemas.ApplicationOut)
def move_status(application_id: str, new_status: str = Query(..., description="e.g., applied, interviewing, offer, rejected"), user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    app = db.query(models.Application).filter(models.Application.application_id == application_id, models.Application.user_id == user_id).first()
    if not app: raise HTTPException(404, "Application not found")
    app.status = new_status
    db.commit(); db.refresh(app)
    return app

@router.delete("/{application_id}", status_code=204)
def delete_application(application_id: str, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    app = db.query(models.Application).filter(models.Application.application_id == application_id, models.Application.user_id == user_id).first()
    if not app: raise HTTPException(404, "Application not found")
    db.delete(app); db.commit()
