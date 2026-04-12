import os
import certifi
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import get_db
from auth import router as auth_router, get_current_user
from routers.users import router as users_router
from routers.interactions import router as interactions_router
from routers.network import router as network_router
from agents.cv_reader import extract_cv_insights
from agents.job_matcher import semantic_multi_agent_search

from database import get_db, init_db

app = FastAPI(title="Cohort Connect API", description="Advanced Minimal Professional Graph", version="2.0.0")

@app.on_event("startup")
async def startup_db_client():
    await init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(interactions_router)
app.include_router(network_router)

@app.get("/")
async def root_ping():
    return {
        "system": "Cohort Connect Engine v2.0",
        "status": "online",
        "documentation": "/docs",
        "message": "API endpoints are actively serving."
    }

@app.get("/health")
async def health_check():
    db = get_db()
    # Simple db ping
    try:
        await db.command("ping")
        db_status = "connected"
    except Exception as e:
        db_status = f"disconnected: {str(e)}"
        
    return {
        "status": "healthy",
        "database": db_status,
        "active_modules": [
            "authentication",
            "users",
            "interactions",
            "network",
            "semantic_search",
            "cv_extraction"
        ]
    }

@app.get("/api/jobs")

async def get_jobs():
    db = get_db()
    jobs = await db.jobs.find().to_list(100)
    for j in jobs: j["_id"] = str(j["_id"])
    return {"status": "success", "data": jobs}

@app.get("/api/alumni")
async def get_alumni():
    db = get_db()
    alums = await db.alumni.find().to_list(100)
    for a in alums: a["_id"] = str(a["_id"])
    return {"status": "success", "data": alums}
from agents.matcher import calculate_match_scores
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from core.config import settings

@app.get("/api/students")
async def get_students():
    db = get_db()
    students = await db.students.find().to_list(100)
    for s in students: s["_id"] = str(s["_id"])
    return {"status": "success", "data": students}

@app.post("/api/upload-cv")
async def upload_cv(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        return {"status": "error", "message": "Access Denied: Only authenticated Students can update capability vectors."}
        
    db = get_db()
    file_location = f"/tmp/{file.filename}"
    try:
        content = await file.read()
        with open(file_location, "wb") as f:
            f.write(content)
            
        insights = await extract_cv_insights(file_location)
        
        if os.path.exists(file_location):
            os.remove(file_location)
            
        if "error" in insights:
            return {"status": "error", "message": insights["error"]}
        
        # Save raw CV and metadata to cvs collection
        raw_text = insights.pop("raw_text", "")
        cv_doc = {
            "student_email": current_user["email"],
            "student_name": current_user["name"],
            "raw_text": raw_text,
            "metadata": insights
        }
        await db.cvs.update_one({"student_email": current_user["email"]}, {"$set": cv_doc}, upsert=True)
            
        profile_update = {"name": current_user["name"], "email": current_user["email"], **insights}
        await db.students.update_one({"email": current_user["email"]}, {"$set": profile_update}, upsert=True)
        return {"status": "parsed", "data": profile_update}

    except Exception as e:
        if os.path.exists(file_location):
            os.remove(file_location)
        return {"status": "error", "message": f"Server error processing PDF: {str(e)}"}

@app.get("/api/jobs/matches")
async def get_job_matches(current_user: dict = Depends(get_current_user)):
    db = get_db()
    jobs_cursor = await db.jobs.find().to_list(1000)
    jobs = []
    for j in jobs_cursor:
        j["_id"] = str(j["_id"])
        jobs.append(j)

    if current_user.get("role") != "student":
        return {"status": "success", "data": jobs}
        
    student = await db.students.find_one({"email": current_user["email"]})
    if not student or not student.get("skills"):
        return {"status": "success", "data": jobs}
        
    # Semantic Matching Engine
    matched_jobs = calculate_match_scores(student.get("skills"), jobs, "required_skills")
    # Return sorted by score descending
    matched_jobs.sort(key=lambda x: x.get("matchScore", 0), reverse=True)
    return {"status": "success", "data": matched_jobs}

@app.get("/api/jobs/{job_id}")
async def get_job_detail(job_id: str):
    from bson.objectid import ObjectId
    db = get_db()
    job = await db.jobs.find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job["_id"] = str(job["_id"])
    return {"status": "success", "data": job}

@app.get("/api/alumni/matches")
async def get_alumni_matches(current_user: dict = Depends(get_current_user)):
    db = get_db()
    alumni_cursor = await db.alumni.find().to_list(1000)
    alumni = []
    for a in alumni_cursor:
        a["_id"] = str(a["_id"])
        alumni.append(a)

    if current_user.get("role") != "student":
        return {"status": "success", "data": alumni}
        
    student = await db.students.find_one({"email": current_user["email"]})
    if not student or not student.get("skills"):
        return {"status": "success", "data": alumni}
        
    # Semantic Matching Engine
    matched_alumni = calculate_match_scores(student.get("skills"), alumni, "expertise")
    matched_alumni.sort(key=lambda x: x.get("matchScore", 0), reverse=True)
    return {"status": "success", "data": matched_alumni}

@app.get("/api/jobs/{job_id}/analyze")
async def analyze_job_match(job_id: str, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "student":
        raise HTTPException(status_code=403, detail="Only students can access job analysis.")
        
    from bson.objectid import ObjectId
    db = get_db()
    job = await db.jobs.find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
        
    cv = await db.cvs.find_one({"student_email": current_user["email"]})
    if not cv:
        raise HTTPException(status_code=400, detail="Please upload your CV to generate an analysis.")
        
    try:
        import os
        os.environ["GOOGLE_API_KEY"] = settings.GOOGLE_API_KEY or ""
        llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.2)
        
        prompt_template = """
        You are an expert AI Career Coach. 
        Job Details:
        Title: {job_title}
        Company: {company}
        Description: {description}
        Requirements: {requirements}
        
        Candidate Skills: {candidate_skills}
        
        Task:
        Provide a concise analysis for this specific candidate against this specific job.
        Format your response as a JSON dictionary exactly like this:
        {{
            "match_reason": "Provide a 2-3 sentence explanation of why they are a good fit.",
            "missing_skills": ["Skill 1", "Skill 2"],
            "recommended_courses": ["Course title 1", "Course title 2"],
            "hireability_advice": "A short, actionable tip."
        }}
        """
        prompt = PromptTemplate(template=prompt_template, input_variables=["job_title", "company", "description", "requirements", "candidate_skills"])
        chain = prompt | llm
        
        result = await chain.ainvoke({
            "job_title": job.get("title", ""),
            "company": job.get("company", ""),
            "description": job.get("description", ""),
            "requirements": ", ".join(job.get("required_skills", [])),
            "candidate_skills": ", ".join(cv.get("metadata", {}).get("skills", []))
        })
        
        text_response = result.content
        import json
        
        # Clean JSON fences if present
        if text_response.startswith("```json"):
            text_response = text_response.split("```json")[1]
        if text_response.endswith("```"):
            text_response = text_response.rsplit("```", 1)[0]
            
        analysis_data = json.loads(text_response.strip())
        return {"status": "success", "analysis": analysis_data}
        
    except Exception as e:
        print(f"GenAI Error: {e}")
        return {"status": "error", "message": "Failed to run analysis via GenAI engine."}

@app.post("/api/semantic-search")
async def search_candidates(query: str = Form(...), current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["employer", "admin"]:
        return {"status": "error", "message": "Access Denied: Only Employers can invoke the semantic search graph."}
        
    db = get_db()
    try:
        results = await semantic_multi_agent_search(query, db)
        return results
    except Exception as e:
        return {"status": "error", "message": f"Server crash: {str(e)}"}

