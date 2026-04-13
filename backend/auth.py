from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from pydantic import BaseModel
import jwt
from datetime import datetime, timedelta
from database import get_db
from models import UserCreate
from core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

router = APIRouter(prefix="/api/auth", tags=["auth"])

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

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

    user.pop("hashed_password", None)
    user["_id"] = str(user["_id"])
    return user

@router.post("/register")
async def register(user: UserCreate):
    db = get_db()
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_dict = user.model_dump()
    password = user_dict.pop("password")
    user_dict["hashed_password"] = get_password_hash(password)
    user_dict["is_active"] = True
    user_dict["role"] = user.role.value

    await db.users.insert_one(user_dict)

    if user.role.value == "alumni":
        await db.alumni.insert_one({
            "name": user.name,
            "email": user.email,
            "role": "New Grad",
            "company": "Not Specified",
            "graduation_year": datetime.utcnow().year,
            "expertise": [],
            "referrals_sent": 0
        })
    elif user.role.value == "student":
        await db.students.insert_one({
            "name": user.name,
            "email": user.email,
            "skills": [],
            "projects": [],
            "experience": [],
            "domain_competency": "Unverified",
            "hireability_score": 0,
            "improvement_feedback": [],
            "raw_text": "",
            "outcome": None
        })

    access_token = create_access_token(data={"sub": user.email, "role": user.role.value})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role.value,
        "name": user.name,
        "email": user.email,
        "id": str(user_dict.get("_id")) if "_id" in user_dict else None
    }

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_db()
    user = await db.users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    access_token = create_access_token(data={"sub": user["email"], "role": user["role"]})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user["role"],
        "name": user["name"],
        "email": user["email"],
        "id": str(user["_id"])
    }

@router.put("/password")
async def update_password(payload: PasswordChangeRequest, current_user: dict = Depends(get_current_user)):
    db = get_db()
    user = await db.users.find_one({"email": current_user["email"]})
    if not user or not verify_password(payload.current_password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect current password")

    new_hashed = get_password_hash(payload.new_password)
    await db.users.update_one(
        {"email": current_user["email"]},
        {"$set": {"hashed_password": new_hashed}}
    )
    return {"status": "success", "message": "Password updated successfully"}

@router.get("/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": str(current_user["_id"]),
        "email": current_user["email"],
        "role": current_user["role"],
        "name": current_user["name"]
    }