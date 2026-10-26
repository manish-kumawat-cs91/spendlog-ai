import os
import secrets

from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


load_dotenv()

APP_PASSWORD = os.getenv("APP_PASSWORD")

active_tokens = set()

security = HTTPBearer()


def create_token():
    token = secrets.token_urlsafe(32)

    active_tokens.add(token)

    return token


def verify_password(password: str):

    if password != APP_PASSWORD:
        raise HTTPException(
            status_code=401,
            detail="Incorrect password"
        )

    return create_token()


def require_auth(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    token = credentials.credentials

    if token not in active_tokens:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired access"
        )

    return True