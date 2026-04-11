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

def verify_password(plain_password, hashed_password):
    try:
        if pwd_context.verify(plain_password, hashed_password):
            return True
    except Exception:
        pass
    # Legacy fallback
    return plain_password == hashed_password

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
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
    
    await db.users.insert_one(user_dict)
    
    # Pre-populate specific dashboards for students and alumni
    if user.role == "alumni":
        await db.alumni.insert_one({
            "name": user.name, "role": "New Grad", "company": "Not Specified", "graduation_year": datetime.utcnow().year, "expertise": []
        })
    elif user.role == "student":
        await db.students.insert_one({
             "name": user.name, "email": user.email, "skills": [], "projects": [], "domain_competency": "Unverified", "hireability_score": 0
        })
    
    access_token = create_access_token(data={"sub": user.email, "role": user.role.value})
    return {"access_token": access_token, "token_type": "bearer", "role": user.role.value, "name": user.name, "email": user.email}

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_db()
    user = await db.users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
        
    access_token = create_access_token(data={"sub": user["email"], "role": user["role"]})
    return {"access_token": access_token, "token_type": "bearer", "role": user["role"], "name": user["name"], "email": user["email"]}

@router.put("/password")
async def update_password(payload: PasswordChangeRequest, current_user: dict = Depends(get_current_user)):
    db = get_db()
    user = await db.users.find_one({"email": current_user["email"]})
    if not user or not verify_password(payload.current_password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    new_hashed = get_password_hash(payload.new_password)
    await db.users.update_one({"email": current_user["email"]}, {"$set": {"hashed_password": new_hashed}})
    return {"status": "success", "message": "Password updated successfully"}

@router.get("/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return {"email": current_user["email"], "role": current_user["role"], "name": current_user["name"]}
