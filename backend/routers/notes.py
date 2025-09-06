# app/routers/notes.py
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from ..deps import get_db
from .. import models, schemas
import uuid
from datetime import datetime, timezone

router = APIRouter(prefix="/applications/{application_id}/notes", tags=["notes"])

def _uid(request: Request) -> str:
    uid = getattr(request.state, "user_id", None)
    if not uid:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return uid

@router.post("", response_model=schemas.NoteOut, status_code=201)
def create_note(
    application_id: str,
    payload: schemas.NoteCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    user_id = _uid(request)

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

    note = models.ApplicationNote(
        note_id=str(uuid.uuid4()),
        application_id=application_id,
        user_id=user_id,
        content=(payload.content or "").strip(),
        created_at=datetime.now(timezone.utc),
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

@router.get("", response_model=list[schemas.NoteOut])
def list_notes(
    application_id: str,
    request: Request,
    db: Session = Depends(get_db),
):
    user_id = _uid(request)

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

    rows = (
        db.query(models.ApplicationNote)
        .filter(
            models.ApplicationNote.application_id == application_id,
            models.ApplicationNote.user_id == user_id,
        )
        .order_by(models.ApplicationNote.created_at.desc())
        .all()
    )
    return rows

@router.delete("/{note_id}", status_code=204)
def delete_note(
    application_id: str,
    note_id: str,
    request: Request,
    db: Session = Depends(get_db),
):
    user_id = _uid(request)

    note = (
        db.query(models.ApplicationNote)
        .filter(
            models.ApplicationNote.note_id == note_id,
            models.ApplicationNote.application_id == application_id,
            models.ApplicationNote.user_id == user_id,
        )
        .first()
    )
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()

@router.patch("/{note_id}", response_model=schemas.NoteOut)
def update_note(
    application_id: str,
    note_id: str,
    payload: schemas.NoteCreate,  # reuses schema with `content: str`
    request: Request,
    db: Session = Depends(get_db),
):
    user_id = _uid(request)

    # Ensure the application belongs to the current user
    app_row = (
        db.query(models.Application)
        .filter(
            models.Application.application_id == application_id,
            models.Application.user_id == user_id,
        )
        .first()
    )
    if not app_row:
        raise HTTPException(status_code=404, detail="Application not found")

    # Find the note within that app & user
    note = (
        db.query(models.ApplicationNote)
        .filter(
            models.ApplicationNote.note_id == note_id,
            models.ApplicationNote.application_id == application_id,
            models.ApplicationNote.user_id == user_id,
        )
        .first()
    )
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    new_content = (payload.content or "").strip()
    if not new_content:
        raise HTTPException(status_code=400, detail="Content cannot be empty")

    note.content = new_content
    # If you have an updated_at column, you can also set it here:
    # note.updated_at = datetime.now(timezone.utc)

    try:
        db.commit()
        db.refresh(note)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Could not update note: {e}")

    return note
