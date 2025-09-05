# backend/auth.py
import json
import urllib.request
from dotenv import load_dotenv
import os
from functools import lru_cache

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from .db import get_db
from .models import User


# ==== CONFIG ====
load_dotenv()

COGNITO_REGION = os.getenv("COGNITO_REGION")
USER_POOL_ID = os.getenv("USER_POOL_ID")
APP_CLIENT_ID = os.getenv("APP_CLIENT_ID")

COGNITO_ISSUER = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{USER_POOL_ID}"
JWKS_URL = f"{COGNITO_ISSUER}/.well-known/jwks.json"

# ==== HELPERS ====

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

def get_current_user(db: Session = Depends(get_db), token: str = Depends(bearer_token)) -> User:
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
