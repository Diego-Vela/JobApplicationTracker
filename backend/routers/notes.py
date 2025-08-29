# app/routers/notes.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..deps import get_db, get_current_user_id
from .. import models, schemas

router = APIRouter(prefix="/applications/{aplication_id}/notes", tags=["notes"])

@router.post("", response_model=schemas.NoteOut, status_code=201)
def add_note(aplication_id: str, payload: schemas.NoteCreate, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    app = db.query(models.Application).filter(models.Application.aplication_id == aplication_id, models.Application.user_id == user_id).first()
    if not app: raise HTTPException(404, "Application not found")
    note = models.ApplicationNote(aplication_id=aplication_id, user_id=user_id, content=payload.content)
    db.add(note); db.commit(); db.refresh(note)
    return note

@router.get("", response_model=list[schemas.NoteOut])
def list_notes(aplication_id: str, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    app = db.query(models.Application).filter(models.Application.aplication_id == aplication_id, models.Application.user_id == user_id).first()
    if not app: raise HTTPException(404, "Application not found")
    rows = db.query(models.ApplicationNote).filter(models.ApplicationNote.aplication_id == aplication_id, models.ApplicationNote.user_id == user_id).order_by(models.ApplicationNote.created_at.desc()).all()
    return rows

@router.delete("/{note_id}", status_code=204)
def delete_note(aplication_id: str, note_id: str, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    note = db.query(models.ApplicationNote).filter(
        models.ApplicationNote.note_id == note_id,
        models.ApplicationNote.aplication_id == aplication_id,
        models.ApplicationNote.user_id == user_id
    ).first()
    if not note: raise HTTPException(404, "Note not found")
    db.delete(note); db.commit()
