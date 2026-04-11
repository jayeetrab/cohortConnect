import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

async def seed_alumni():
    MONGODB_URI = "mongodb+srv://jayeetrab:mGhnfdMwFeFZwx6L@cohortconnect.lcpylgn.mongodb.net/"
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client.get_database("cohortconnect")
    
    alumni_data = [
        {
            "name": "Sarah Jenkins",
            "role": "Senior AI Architect",
            "company": "DeepMind",
            "graduation_year": 2018,
            "expertise": ["Reinforcement Learning", "Neural Architecture", "PyTorch"]
        },
        {
            "name": "David Chen",
            "role": "Quantitative Researcher",
            "company": "Goldman Sachs",
            "graduation_year": 2019,
            "expertise": ["Stochastic Calculus", "High-Frequency Trading", "C++"]
        },
        {
            "name": "Priya Sharma",
            "role": "Lead Data Scientist",
            "company": "JP Morgan Chase",
            "graduation_year": 2020,
            "expertise": ["Fraud Detection", "XGBoost", "Spark SQL"]
        },
        {
            "name": "Michael Ross",
            "role": "Blockchain Engineer",
            "company": "Coinbase",
            "graduation_year": 2021,
            "expertise": ["Solidity", "Zero-Knowledge Proofs", "Go"]
        },
        {
            "name": "Elena Rodriguez",
            "role": "Machine Learning Engineer",
            "company": "Tesla",
            "graduation_year": 2017,
            "expertise": ["Computer Vision", "Autopilot Systems", "CUDA"]
        },
        {
            "name": "James Wilson",
            "role": "Director of Technology",
            "company": "Amazon AWS",
            "graduation_year": 2015,
            "expertise": ["Distibuted Systems", "Serverless Infrastructure", "Rust"]
        }
    ]
    
    # Clean and insert
    await db.alumni.delete_many({})
    result = await db.alumni.insert_many(alumni_data)
    print(f"Successfully seeded {len(result.inserted_ids)} alumni nodes into the graph.")

if __name__ == "__main__":
    asyncio.run(seed_alumni())
