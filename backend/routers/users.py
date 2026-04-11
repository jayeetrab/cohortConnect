from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from database import get_db
from auth import get_current_user

router = APIRouter(prefix="/api/users", tags=["users"])

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    projects: Optional[List[str]] = None

@router.get("/me")
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    db = get_db()
    profile = {}
    if current_user.get("role") == "student":
        student_data = await db.students.find_one({"email": current_user["email"]})
        if student_data:
            student_data["_id"] = str(student_data["_id"])
            profile = student_data
    elif current_user.get("role") == "alumni":
        alumni_data = await db.alumni.find_one({"name": current_user["name"]})
        if alumni_data:
            alumni_data["_id"] = str(alumni_data["_id"])
            profile = alumni_data
            
    # Remove sensitive info
    user_data = {k: v for k, v in current_user.items() if k not in ["hashed_password", "_id"]}
    return {"user": user_data, "profile": profile}

@router.put("/me")
async def update_my_profile(profile_data: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    update_dict = {k: v for k, v in profile_data.model_dump().items() if v is not None}
    
    if not update_dict:
        return {"status": "success", "message": "Nothing to update"}
    
    if current_user.get("role") == "student":
        await db.students.update_one(
            {"email": current_user["email"]}, 
            {"$set": update_dict},
            upsert=True
        )
    elif current_user.get("role") == "alumni":
        await db.alumni.update_one(
            {"name": current_user["name"]}, 
            {"$set": update_dict},
            upsert=True
        )
        
    await db.users.update_one(
        {"email": current_user["email"]},
        {"$set": update_dict}
    )
    return {"status": "success", "message": "Profile updated"}
