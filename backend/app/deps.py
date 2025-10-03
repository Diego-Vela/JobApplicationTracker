# app/deps.py
import os, json, urllib.request
from functools import lru_cache
from typing import Optional

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.db import SessionLocal
from app.models import User

# ---- Modes ----
AUTH_MODE  = os.getenv("AUTH_MODE", "cognito")  # "cognito" | "local" | "dev-noverify"
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
ALGORITHM  = "HS256"

# ---- Cognito config ----
COGNITO_REGION   = os.getenv("COGNITO_REGION")
USER_POOL_ID     = os.getenv("USER_POOL_ID")
APP_CLIENT_ID    = os.getenv("APP_CLIENT_ID")
COGNITO_ISSUER   = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{USER_POOL_ID}" if COGNITO_REGION and USER_POOL_ID else None
JWKS_URL         = f"{COGNITO_ISSUER}/.well-known/jwks.json" if COGNITO_ISSUER else None

security = HTTPBearer()  # 401 automatically if missing

# ---- DB dependency ----
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---- Local JWT (only for AUTH_MODE="local") ----
def _decode_local_jwt(token: str) -> str:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        if not sub:
            raise HTTPException(status_code=401, detail="Invalid token: no sub")
        return sub
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")

# ---- JWKS helpers ----
@lru_cache
def _get_jwks() -> dict:
    with urllib.request.urlopen(JWKS_URL, timeout=300) as f:
        return json.load(f)

def _verify_cognito(token: str) -> dict:
    if not (COGNITO_REGION and USER_POOL_ID and APP_CLIENT_ID):
        raise HTTPException(status_code=500, detail="Cognito ENV not configured")
    if not JWKS_URL:
        raise HTTPException(status_code=500, detail="Cognito issuer not derived")

    def decode_with_jwks(jwks: dict, *, audience: str | None, verify_aud: bool) -> dict:
        options = None if verify_aud else {"verify_aud": False}
        return jwt.decode(
            token,
            jwks,
            algorithms=["RS256"],
            issuer=COGNITO_ISSUER,
            audience=audience,
            options=options,
        )

    # Peek at unverified claims to decide which checks to apply
    try:
        unverified = jwt.get_unverified_claims(token)
        token_use = unverified.get("token_use")
    except Exception:
        # If we can't parse claims, fall back to full decode (will raise)
        token_use = None

    # First attempt with current JWKS
    try:
        jwks = _get_jwks()

        if token_use == "id":
            # ID token: validate audience against APP_CLIENT_ID
            claims = decode_with_jwks(jwks, audience=APP_CLIENT_ID, verify_aud=True)
            if not claims.get("email_verified"):
                raise HTTPException(status_code=403, detail="Email not verified")
            return claims

        elif token_use == "access":
            # Access token: no audience; validate client_id manually
            claims = decode_with_jwks(jwks, audience=None, verify_aud=False)
            if claims.get("client_id") != APP_CLIENT_ID:
                raise JWTError("Invalid client_id for access token")
            return claims

        else:
            # Unknown or missing token_use – try strict ID-token path; if it fails, raise
            claims = decode_with_jwks(jwks, audience=APP_CLIENT_ID, verify_aud=True)
            if claims.get("token_use") != "id":
                raise JWTError("Unsupported token_use")
            if not claims.get("email_verified"):
                raise HTTPException(status_code=403, detail="Email not verified")
            return claims

    except JWTError:
        # Keys may have rotated: refresh JWKS once and retry
        _get_jwks.cache_clear()
        jwks = _get_jwks()

        if token_use == "id":
            claims = decode_with_jwks(jwks, audience=APP_CLIENT_ID, verify_aud=True)
            if not claims.get("email_verified"):
                raise HTTPException(status_code=403, detail="Email not verified")
            return claims
        elif token_use == "access":
            claims = decode_with_jwks(jwks, audience=None, verify_aud=False)
            if claims.get("client_id") != APP_CLIENT_ID:
                raise JWTError("Invalid client_id for access token")
            return claims
        else:
            claims = decode_with_jwks(jwks, audience=APP_CLIENT_ID, verify_aud=True)
            if claims.get("token_use") != "id":
                raise JWTError("Unsupported token_use")
            if not claims.get("email_verified"):
                raise HTTPException(status_code=403, detail="Email not verified")
            return claims
        
# ---- Unified current user dependency ----
def get_current_user_id(
    db: Session = Depends(get_db),
    creds: HTTPAuthorizationCredentials = Depends(security),
) -> User:
    token = creds.credentials

    if AUTH_MODE == "dev-noverify":
        # token == user_id (dev only)
        user = db.query(User).filter(User.user_id == token).first()
        if not user:
            raise HTTPException(status_code=401, detail="Unknown dev user_id")
        return user

    if AUTH_MODE == "local":
        sub = _decode_local_jwt(token)
        user = db.query(User).filter(User.cognito_sub == sub).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found (local mode)")
        return user

    # Default: Cognito
    claims = _verify_cognito(token)

    if not claims.get("email_verified"):
        raise HTTPException(status_code=403, detail="Email not verified")

    sub = claims["sub"]
    email: Optional[str] = claims.get("email")
    email = email.lower() if isinstance(email, str) else None

    user = db.query(User).filter(User.cognito_sub == sub).first()
    if not user:
        user = User(cognito_sub=sub, email=email or "")
        db.add(user)
        db.commit()
        db.refresh(user)

    return user
