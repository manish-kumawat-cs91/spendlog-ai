from fastapi import APIRouter
from pydantic import BaseModel

from auth import verify_password


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


class LoginRequest(BaseModel):
    password: str


@router.post("/unlock")
def unlock(data: LoginRequest):
    token = verify_password(data.password)

    return {
        "message": "Access granted!",
        "access_token": token
    }
    