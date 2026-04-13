import os
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings

client = None
db = None

def get_db():
    global client, db
    if client is None:
        client = AsyncIOMotorClient(settings.MONGODB_URI, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=5000)
        db = client.cohortconnect
    return db

async def init_db():
    d = get_db()
    # Performance optimization: create indexes
    await d.users.create_index("email", unique=True)
    await d.students.create_index("email", unique=True)
    await d.jobs.create_index("title")
    await d.alumni.create_index("name")
    
    # Add these for messaging
    await d.conversations.create_index([("user_a_id", 1), ("user_b_id", 1)])
    await d.messages.create_index([("conversation_id", 1), ("created_at", -1)])

