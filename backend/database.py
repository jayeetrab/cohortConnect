import os
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings

client = None
db = None

def get_db():
    global client, db
    if client is None:
        client = AsyncIOMotorClient(settings.MONGODB_URI, tlsCAFile=certifi.where())
        db = client.cohortconnect
    return db

async def init_db():
    d = get_db()
    # Performance optimization: create indexes
    await d.users.create_index("email", unique=True)
    await d.students.create_index("email", unique=True)
    await d.jobs.create_index("title")
    await d.alumni.create_index("name")

