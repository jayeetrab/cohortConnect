import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import certifi
import os

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://jayeetrab:mGhnfdMwFeFZwx6L@cohortconnect.lcpylgn.mongodb.net/")
client = AsyncIOMotorClient(MONGODB_URI, tlsCAFile=certifi.where())
db = client.cohortconnect

async def seed():
    print("Clearing collections...")
    await db.jobs.drop()
    await db.alumni.drop()
    await db.students.drop()
    
    jobs = [
        {"title": "AI Engineer", "company": "Goldman Sachs", "description": "Need someone to build LLMs for financial risk forecasting and quantitative modelling.", "required_skills": ["Python", "LangChain", "Machine Learning", "Finance"], "location": "London, UK"},
        {"title": "Senior Data Analyst - Credit Risk", "company": "JP Morgan", "description": "Looking for statistical modelling, credit default prediction, and risk analytics expertise.", "required_skills": ["Python", "SQL", "Statistics", "Risk Models"], "location": "London, UK"},
        {"title": "Fullstack Software Engineer", "company": "Amazon", "description": "Building scalable asynchronous systems with modern Python web frameworks and NoSQL.", "required_skills": ["FastAPI", "MongoDB", "React", "AWS"], "location": "Bristol, UK"},
        {"title": "Data Scientist", "company": "Barclays", "description": "Deriving insights from large datasets to optimize consumer experience and operations.", "required_skills": ["SQL", "Tableau", "Python"], "location": "London, UK"},
    ]
    
    alumnis = [
        {"name": "Arpita Sharma", "role": "Data Scientist", "company": "JP Morgan", "graduation_year": 2023, "expertise": ["Machine Learning", "Finance"]},
        {"name": "James Chen", "role": "Backend Engineer", "company": "Amazon", "graduation_year": 2024, "expertise": ["Cloud", "System Design"]},
        {"name": "Sofia Martínez", "role": "Quantitative Analyst", "company": "Goldman Sachs", "graduation_year": 2022, "expertise": ["Risk Analysis", "Python", "R"]},
        {"name": "Elena Kowalski", "role": "Data Engineer", "company": "Barclays", "graduation_year": 2023, "expertise": ["Data Pipelines", "SQL", "AWS"]},
    ]

    students = [
        {"name": "Alice Wang", "email": "alice@bristol.ac.uk", "skills": ["Python", "Machine Learning", "Transformers"], "projects": ["Built an LLM for trading"], "domain_competency": "AI & Finance", "hireability_score": 95, "improvement_feedback": ["Show AWS infrastructure skills"]},
        {"name": "Bob Smith", "email": "bob@bristol.ac.uk", "skills": ["React", "Node.js", "MongoDB"], "projects": ["Social network clone"], "domain_competency": "Fullstack Web", "hireability_score": 88, "improvement_feedback": ["Include more system design details"]},
        {"name": "Charlie Lee", "email": "charlie@bristol.ac.uk", "skills": ["SQL", "Tableau", "Excel"], "projects": ["Credit risk analysis"], "domain_competency": "Data Analytics", "hireability_score": 92, "improvement_feedback": ["Quantify impact in projects"]},
        {"name": "Diana Prince", "email": "diana@bristol.ac.uk", "skills": ["Python", "FastAPI", "Docker", "AWS"], "projects": ["High-throughput API"], "domain_competency": "Backend Engineering", "hireability_score": 91, "improvement_feedback": ["Emphasize CI/CD pipelines"]},
    ]
    
    await db.jobs.insert_many(jobs)
    await db.alumni.insert_many(alumnis)
    await db.students.insert_many(students)
    print("Database seeded with jobs, alumni, and realistic student DB profiles!")

if __name__ == "__main__":
    asyncio.run(seed())
