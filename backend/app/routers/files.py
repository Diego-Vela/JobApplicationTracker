# app/routers/files.py
from fastapi import APIRouter, HTTPException, status, Query, Request, Depends
from sqlalchemy.orm import Session
from app.deps import get_db  # keep DB dependency only
from app import schemas, models
from botocore.config import Config
from urllib.parse import urlparse
from urllib.parse import quote as urlquote
from botocore.exceptions import ClientError
from typing import Literal
from sqlalchemy.exc import IntegrityError

# NEW: imports for S3 presign + utils
import os, re, uuid, mimetypes, boto3, requests

router = APIRouter(prefix="/files", tags=["files"])

# -------------------- Config --------------------
S3_BUCKET   = os.getenv("S3_BUCKET_NAME")
S3_REGION   = os.getenv("S3_REGION")
CDN_DOMAIN  = os.getenv("S3_CLOUDFRONT_DOMAIN")  
MAX_SIZE    = 10 * 1024 * 1024  # 10 MB hard cap
ALLOWED_CT  = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

s3 = boto3.client(
    "s3",
    region_name=S3_REGION,
    config=Config(signature_version="s3v4", s3={"addressing_style": "virtual"}),
)

# -------------------- Helpers --------------------
SAFE_CHARS = re.compile(r"[^A-Za-z0-9._-]+")

def _require_user_id(request: Request) -> str:
    """
    Pull the authenticated user_id from request.state.user_id.
    Your router-level auth dependency (added in main.py) must set this.
    """
    uid = getattr(request.state, "user_id", None)
    if not uid:
        # Auth dependency not attached, or didn't set state
        raise HTTPException(status_code=401, detail="Not authenticated")
    return uid

def safe_download_name(name: str, fallback_ext: str = "") -> str:
    """
    Sanitize a suggested download name.
    If it has no extension, append fallback_ext (e.g., ".pdf").
    """
    name = (name or "download").strip().strip(".")
    # very permissive: keep common filename chars
    name = re.sub(r'[^A-Za-z0-9._\- ()]+', "_", name)
    if fallback_ext and not os.path.splitext(name)[1]:
        name += fallback_ext
    # cap length to avoid header issues
    return name[:120] or f"download{fallback_ext}"

def content_disposition_for(name: str) -> str:
    """
    RFC 5987 compatible header with ASCII fallback and UTF-8 filename*.
    """
    ascii_fallback = name.encode("ascii", "ignore").decode() or "download"
    utf8_encoded = urlquote(name, safe="")
    return f'attachment; filename="{ascii_fallback}"; filename*=UTF-8\'\'{utf8_encoded}'

def sanitize_filename(name: str) -> str:
    base = os.path.basename(name).strip()
    if not base:
        base = "file"
    root, ext = os.path.splitext(base)
    root = SAFE_CHARS.sub("_", root)[:80] or "file"
    ext  = SAFE_CHARS.sub("", ext)[:10]
    return root + ext

def object_key_for(user_id: str, filename: str) -> str:
    ext = os.path.splitext(filename)[1][:10]
    return f"{user_id}/{uuid.uuid4().hex}{ext}"

def public_url_for(key: str) -> str:
    if CDN_DOMAIN:
        return f"https://{CDN_DOMAIN}/{key}"
    return f"https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/{key}"

def key_from_url(url: str) -> str:
    """
    Extract the object key from URLs like:
      https://<bucket>.s3.<region>.amazonaws.com/<key>
      https://<cloudfront-domain>/<key>
    """
    p = urlparse(url)
    return p.path.lstrip("/")  # everything after the first '/'

def verify_s3_object(url: str, max_size: int = MAX_SIZE):
    """Verify uploaded object using AWS credentials."""
    key = key_from_url(url)
    try:
        head = s3.head_object(Bucket=S3_BUCKET, Key=key)
        size = int(head.get("ContentLength", 0))
        ct = (head.get("ContentType") or "").lower()

        if size <= 0 or size > max_size:
            raise HTTPException(status_code=400, detail=f"Invalid object size: {size} bytes")
        if ct not in ALLOWED_CT:
            raise HTTPException(status_code=400, detail=f"Unexpected content type: {ct}")
    except ClientError as e:
        msg = e.response.get("Error", {}).get("Message", "Access denied")
        raise HTTPException(status_code=400, detail=f"Upload verification failed: {msg}")

# -------------------- Presign --------------------
@router.post("/presign")
def presign_upload(
    request: Request,
    filename: str = Query(..., min_length=1, max_length=255),
    content_type: str | None = None,
):
    user_id = _require_user_id(request)

    clean_name = sanitize_filename(filename)
    ct = (content_type or mimetypes.guess_type(clean_name)[0] or "application/octet-stream").lower()
    if ct not in ALLOWED_CT:
        raise HTTPException(status_code=400, detail="Unsupported file type. Use PDF, DOC, or DOCX.")

    key = object_key_for(user_id, clean_name)

    try:
        conditions = [
            {"bucket": S3_BUCKET},
            {"key": key},
            {"Content-Type": ct},
            ["content-length-range", 1, MAX_SIZE],
        ]
        fields = {"Content-Type": ct}

        presigned = s3.generate_presigned_post(
            Bucket=S3_BUCKET,
            Key=key,
            Fields=fields,
            Conditions=conditions,
            ExpiresIn=600,
        )

        post_url = f"https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com"

        return {
            "url": post_url,               # <- use regional URL
            "fields": presigned["fields"], # <- form fields to include
            "file_url": public_url_for(key),
            "key": key,
            "content_type": ct,
            "max_size": MAX_SIZE,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/presign-get")
def presign_get(
    request: Request,
    kind: Literal["resume", "cv"] | None = None,
    item_id: str | None = None,
    key: str | None = None,
    url: str | None = None,
    disposition: Literal["inline", "attachment"] = "attachment",  # NEW
    db: Session = Depends(get_db),
):
    """
    Return a short-lived, signed GET URL for downloading a private object.
    Preferred inputs: kind + item_id (so we can use label/file_name).
    Falls back to url/key if needed (ownership still enforced).
    """
    user_id = _require_user_id(request)

    obj_url: str | None = None
    label: str | None = None
    original_name: str | None = None

    if kind and item_id:
        if kind == "resume":
            rec = db.query(models.Resume).filter(
                models.Resume.resume_id == item_id,
                models.Resume.user_id == user_id
            ).first()
            if not rec:
                raise HTTPException(status_code=404, detail="Resume not found")
            obj_url = rec.resume_url
            label = getattr(rec, "label", None)
            original_name = rec.file_name
        elif kind == "cv":
            rec = db.query(models.CV).filter(
                models.CV.cv_id == item_id,
                models.CV.user_id == user_id
            ).first()
            if not rec:
                raise HTTPException(status_code=404, detail="CV not found")
            obj_url = rec.cv_url
            label = getattr(rec, "label", None)
            original_name = rec.file_name
        else:
            raise HTTPException(status_code=400, detail="Invalid kind")

        if not obj_url:
            raise HTTPException(status_code=400, detail="No URL stored for this item")
        key = key_from_url(obj_url)

    elif url:
        key = key_from_url(url)

    elif not key:
        raise HTTPException(status_code=400, detail="Provide (kind & item_id) or url or key")

    # Ownership check (for url/key path)
    if not key.startswith(f"{user_id}/"):
        raise HTTPException(status_code=403, detail="Forbidden")

    # Decide final download name:
    # 1) prefer label (user-friendly), else original file_name
    # 2) ensure it has the right extension (fall back from key)
    _, key_ext = os.path.splitext(key)
    # If we know the content type, we could map to an ext; key_ext is fine for now
    preferred = (label or original_name or os.path.basename(key)) or "download"
    friendly_name = safe_download_name(preferred, fallback_ext=key_ext)

    try:
        signed = s3.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": S3_BUCKET,
                "Key": key,
                # Use requested disposition
                "ResponseContentDisposition": (
                    f'{disposition}; filename="{friendly_name}"; '
                    f"filename*=UTF-8''{urlquote(friendly_name, safe='')}"
                ),
            },
            ExpiresIn=60 * 5,
        )
        return {"url": signed}
    except ClientError as e:
        msg = e.response.get("Error", {}).get("Message", "Cannot presign download")
        raise HTTPException(status_code=500, detail=msg)

# -------------------- Resumes --------------------
@router.post("/resumes", response_model=schemas.ResumeOut, status_code=201)
def create_resume(
    request: Request,
    meta: schemas.FileMetaIn,
    db: Session = Depends(get_db),
):
    user_id = _require_user_id(request)
    verify_s3_object(meta.url)
    rec = models.Resume(user_id=user_id, resume_url=meta.url, file_name=meta.file_name, label=meta.label)
    db.add(rec); db.commit(); db.refresh(rec)
    return schemas.ResumeOut(
        resume_id=rec.resume_id, file_name=rec.file_name, label=rec.label,
        resume_url=rec.resume_url, uploaded_at=rec.uploaded_at
    )

@router.get("/resumes", response_model=list[schemas.ResumeOut])
def list_resumes(
    request: Request,
    db: Session = Depends(get_db),
):
    user_id = _require_user_id(request)

    rows = (db.query(models.Resume)
              .filter(models.Resume.user_id == user_id)
              .order_by(models.Resume.uploaded_at.desc())
              .all())
    return [
        schemas.ResumeOut(
            resume_id=r.resume_id,
            file_name=r.file_name,
            label=r.label,
            resume_url=r.resume_url,
            uploaded_at=r.uploaded_at
        )
        for r in rows
    ]

@router.delete("/resumes/{resume_id}", status_code=204)
def delete_resume(
    request: Request,
    resume_id: str,
    db: Session = Depends(get_db),
):
    user_id = _require_user_id(request)

    r = (
        db.query(models.Resume)
        .filter(
            models.Resume.resume_id == resume_id,
            models.Resume.user_id == user_id,
        )
        .first()
    )
    if not r:
        raise HTTPException(status_code=404, detail="Resume not found")

    linked_q = db.query(models.Application).filter(
        models.Application.user_id == user_id,
        models.Application.resume_id == resume_id,
    )

    linked_q.update({models.Application.resume_id: None}, synchronize_session=False)

    db.delete(r)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Resume is still referenced by other records and cannot be deleted.",
        )

    if r.resume_url:
        key = key_from_url(r.resume_url)
        try:
            s3.delete_object(Bucket=S3_BUCKET, Key=key)
        except ClientError:
            pass
    return

# -------------------- CV --------------------
@router.post("/cv", response_model=schemas.CVOut, status_code=201)
def create_cv(
    request: Request,
    meta: schemas.FileMetaIn,
    db: Session = Depends(get_db),
):
    user_id = _require_user_id(request)

    verify_s3_object(meta.url)  # 
    rec = models.CV(user_id=user_id, cv_url=meta.url, file_name=meta.file_name, label=meta.label)
    db.add(rec); db.commit(); db.refresh(rec)
    return schemas.CVOut(
        cv_id=rec.cv_id, file_name=rec.file_name, label=rec.label,
        cv_url=rec.cv_url, uploaded_at=rec.uploaded_at
    )

@router.get("/cv", response_model=list[schemas.CVOut])
def list_cv(
    request: Request,
    db: Session = Depends(get_db),
):
    user_id = _require_user_id(request)

    rows = (db.query(models.CV)
              .filter(models.CV.user_id == user_id)
              .order_by(models.CV.uploaded_at.desc())
              .all())
    return [
        schemas.CVOut(
            cv_id=r.cv_id,
            file_name=r.file_name,
            label=r.label,
            cv_url=r.cv_url,
            uploaded_at=r.uploaded_at
        )
        for r in rows
    ]

@router.delete("/cv/{cv_id}", status_code=204)
def delete_cv(
    request: Request,
    cv_id: str,
    db: Session = Depends(get_db),
):
    user_id = _require_user_id(request)

    r = db.query(models.CV).filter(
        models.CV.cv_id == cv_id,
        models.CV.user_id == user_id
    ).first()
    if not r:
        raise HTTPException(404, "CV not found")

    if r.cv_url:
        key = key_from_url(r.cv_url)
        try:
            s3.delete_object(Bucket=S3_BUCKET, Key=key)
        except ClientError:
            pass

    db.delete(r)
    db.commit()
