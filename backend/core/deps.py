from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
import jwt
from typing import Optional
from database import get_db
from models import UserRole
from core.config import settings
from motor.motor_asyncio import AsyncIOMotorDatabase

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    db = get_db()
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    user = await db.users.find_one({"email": email})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
        
    # Exclude hashed_password
    user.pop("hashed_password", None)
    return user

async def get_database() -> AsyncIOMotorDatabase:
    return get_db()
