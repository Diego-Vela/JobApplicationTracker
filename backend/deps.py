# app/deps.py
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
import json
from functools import lru_cache
from .models import User
import urllib.request

from .db import SessionLocal

# ---- Auth config(Unused) ----
AUTH_MODE  = os.getenv("AUTH_MODE", "local")  # "local" | "dev-noverify" | "cognito"
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
ALGORITHM  = "HS256"

# ==== Cognito config ====

COGNITO_REGION = os.getenv("COGNITO_REGION")
USER_POOL_ID = os.getenv("USER_POOL_ID")
APP_CLIENT_ID = os.getenv("APP_CLIENT_ID")

COGNITO_ISSUER = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{USER_POOL_ID}"
JWKS_URL = f"{COGNITO_ISSUER}/.well-known/jwks.json"

# Use simple HTTP Bearer (works now and with Cognito later)
bearer = HTTPBearer(auto_error=False)

# ---- DB dependency ----
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---- Token decoding (local JWT mode - Unused) ----
def _decode_local_jwt(token: str) -> str:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        if not sub:
            raise HTTPException(status_code=401, detail="Invalid token: no sub")
        return sub
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ---- Old user dependency ----
def get_current_user(
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

# ==== Cognito helpers ====

security = HTTPBearer()

@lru_cache
def get_jwks():
    with urllib.request.urlopen(JWKS_URL) as f:
        return json.load(f)

def bearer_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Extracts JWT from Authorization header."""
    return credentials.credentials

def verify_cognito_jwt(token: str) -> dict:
    """Verify a Cognito JWT and return claims."""
    jwks = get_jwks()
    try:
        # jose handles key lookup internally if you pass JWKS
        claims = jwt.decode(
            token,
            jwks,
            algorithms=["RS256"],
            audience=APP_CLIENT_ID,
            issuer=COGNITO_ISSUER,
        )
        return claims
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")

# ==== Cognito user dependency ====

def get_current_user_id(db: Session = Depends(get_db), token: str = Depends(bearer_token)) -> User:
    """Require a valid Cognito user with verified email."""
    claims = verify_cognito_jwt(token)

    if not claims.get("email_verified"):
        raise HTTPException(status_code=403, detail="Email not verified")

    sub = claims["sub"]
    email = claims.get("email")

    user = db.query(User).filter(User.cognito_sub == sub).first()

    if not user:
        # Lazy provision user in your DB
        user = User(cognito_sub=sub, email=email)
        db.add(user)
        db.commit()
        db.refresh(user)

    return user