from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from core.deps import get_current_user, get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

router = APIRouter(prefix="/api/interactions", tags=["interactions"])

class LikeAction(BaseModel):
    item_id: str
    item_type: str # "alumni", "job", "student"
    action: str # "like" or "unlike"

@router.post("/like")
async def toggle_like(payload: LikeAction, current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    try:
        obj_id = ObjectId(payload.item_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid item ID")

    collection = None
    if payload.item_type == "alumni": collection = db.alumni
    elif payload.item_type == "job": collection = db.jobs
    elif payload.item_type == "student": collection = db.students
    else: raise HTTPException(status_code=400, detail="Invalid item type")

    item = await collection.find_one({"_id": obj_id})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # In a real rigorous schema, we would keep an array of 'liked_by' users.
    # For now, we simulate an increment count for the minimal implementation.
    current_likes = item.get("likes", 0)
    
    if payload.action == "like":
        await collection.update_one({"_id": obj_id}, {"$set": {"likes": current_likes + 1}})
    elif payload.action == "unlike":
        await collection.update_one({"_id": obj_id}, {"$set": {"likes": max(0, current_likes - 1)}})

    return {"status": "success", "message": f"{payload.action} recorded"}
