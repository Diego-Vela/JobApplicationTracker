# app/routers/files.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..deps import get_db, get_current_user_id
from .. import models, schemas

router = APIRouter(prefix="/files", tags=["files"])

# ----- Resumes -----
@router.post("/resumes", response_model=schemas.ResumeOut, status_code=201)
def create_resume(meta: schemas.FileMetaIn, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    rec = models.Resume(user_id=user_id, resume_url=meta.url, file_name=meta.file_name, label=meta.label)
    db.add(rec); db.commit(); db.refresh(rec)
    return schemas.ResumeOut(
        resume_id=rec.resume_id, file_name=rec.file_name, label=rec.label, resume_url=rec.resume_url, uploaded_at=rec.uploaded_at
    )

@router.get("/resumes", response_model=list[schemas.ResumeOut])
def list_resumes(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    rows = db.query(models.Resume).filter(models.Resume.user_id == user_id).order_by(models.Resume.uploaded_at.desc()).all()
    return [schemas.ResumeOut(resume_id=r.resume_id, file_name=r.file_name, label=r.label, resume_url=r.resume_url, uploaded_at=r.uploaded_at) for r in rows]

@router.delete("/resumes/{resume_id}", status_code=204)
def delete_resume(resume_id: str, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    r = db.query(models.Resume).filter(models.Resume.resume_id == resume_id, models.Resume.user_id == user_id).first()
    if not r: raise HTTPException(404, "Resume not found")
    db.delete(r); db.commit()

# ----- CV -----
@router.post("/cv", response_model=schemas.CVOut, status_code=201)
def create_cv(meta: schemas.FileMetaIn, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    rec = models.CV(user_id=user_id, cv_url=meta.url, file_name=meta.file_name, label=meta.label)
    db.add(rec); db.commit(); db.refresh(rec)
    return schemas.CVOut(cv_id=rec.cv_id, file_name=rec.file_name, label=rec.label, cv_url=rec.cv_url, uploaded_at=rec.uploaded_at)

@router.get("/cv", response_model=list[schemas.CVOut])
def list_cv(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    rows = db.query(models.CV).filter(models.CV.user_id == user_id).order_by(models.CV.uploaded_at.desc()).all()
    return [schemas.CVOut(cv_id=r.cv_id, file_name=r.file_name, label=r.label, cv_url=r.cv_url, uploaded_at=r.uploaded_at) for r in rows]

@router.delete("/cv/{cv_id}", status_code=204)
def delete_cv(cv_id: str, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    r = db.query(models.CV).filter(models.CV.cv_id == cv_id, models.CV.user_id == user_id).first()
    if not r: raise HTTPException(404, "CV not found")
    db.delete(r); db.commit()
