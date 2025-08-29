# app/deps.py
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os

from .db import SessionLocal

# ---- Auth config ----
AUTH_MODE  = os.getenv("AUTH_MODE", "local")  # "local" | "dev-noverify" | "cognito"
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
ALGORITHM  = "HS256"

# Use simple HTTP Bearer (works now and with Cognito later)
bearer = HTTPBearer(auto_error=False)

# ---- DB dependency ----
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---- Token decoding (local JWT mode) ----
def _decode_local_jwt(token: str) -> str:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        if not sub:
            raise HTTPException(status_code=401, detail="Invalid token: no sub")
        return sub
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ---- Current user dependency ----
def get_current_user_id(
    creds: HTTPAuthorizationCredentials = Depends(bearer),
) -> str:
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = creds.credentials

    if AUTH_MODE == "dev-noverify":
        # For quick local tests: token == user_id
        return token

    # Default: verify locally-signed JWT (swap to Cognito verifier later)
    return _decode_local_jwt(token)
