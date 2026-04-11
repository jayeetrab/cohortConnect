from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from core.deps import get_current_user, get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

router = APIRouter(prefix="/api/network", tags=["network"])

class ConnectRequest(BaseModel):
    target_user_id: str

@router.post("/connect")
async def request_connection(payload: ConnectRequest, current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    # Simple mockup connection mechanism.
    # In an advanced setup, this writes to a "connections" collection modeling a graph edge.
    
    # Store connection request in the db for the target user.
    conn_record = {
        "from_user": current_user["email"],
        "to_user_id": payload.target_user_id,
        "status": "pending"
    }
    await db.connections.insert_one(conn_record)
    
    return {"status": "success", "message": "Connection request sent"}
