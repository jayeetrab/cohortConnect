import os
import certifi
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from database import get_db, init_db
from auth import router as auth_router, get_current_user
from routers.users import router as users_router
from routers.interactions import router as interactions_router
from routers.network import router as network_router
from routers.referrals import router as referrals_router
from agents.cv_reader import extract_cv_insights
from agents.job_matcher import semantic_multi_agent_search, match_student_to_jobs
from agents.referral_agent import analyze_job_fit
from agents.analytics import track_event, get_analytics_summary
from core.config import settings
from bson import ObjectId
from routers.messages import router as messages_router, Conversation, Message

app = FastAPI(
    title="Cohort Connect API",
    description="AI-powered placement intelligence platform — University of Bristol",
    version="2.0.0"
)

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    if settings.GOOGLE_API_KEY:
        os.environ["GOOGLE_API_KEY"] = settings.GOOGLE_API_KEY
    yield
    # Shutdown (if needed)

app = FastAPI(
    title="Cohort Connect API",
    description="AI-powered placement intelligence platform — University of Bristol",
    version="2.0.0",
    lifespan=lifespan  # ← ADD THIS
)

# ── CORS ─────────────────────────────────────────────────────────────────────
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(interactions_router)
app.include_router(network_router)
app.include_router(referrals_router)
app.include_router(messages_router) 

# ── Health / Root ─────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "system": "Cohort Connect Engine v2.0",
        "status": "online",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    db = get_db()
    try:
        await db.command("ping")
        db_status = "connected"
    except Exception as e:
        db_status = f"disconnected: {str(e)}"
    return {
        "status": "healthy",
        "database": db_status,
        "google_ai": "configured" if settings.GOOGLE_API_KEY else "missing — fallback mode active"
    }

# ── Public Data ───────────────────────────────────────────────────────────────
@app.get("/api/jobs")
async def get_jobs():
    db = get_db()
    jobs = await db.jobs.find().to_list(100)
    for j in jobs:
        j["_id"] = str(j["_id"])
    return {"status": "success", "data": jobs}

@app.get("/api/alumni")
async def get_alumni():
    db = get_db()
    alums = await db.alumni.find().to_list(100)
    for a in alums:
        a["_id"] = str(a["_id"])
    return {"status": "success", "data": alums}

# ── Student Endpoints ─────────────────────────────────────────────────────────
@app.get("/api/students")
async def get_students(current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["employer", "admin"]:
        raise HTTPException(status_code=403, detail="Access denied.")
    db = get_db()
    students = await db.students.find().to_list(100)
    for s in students:
        s["_id"] = str(s["_id"])
        s.pop("raw_text", None)  # don't send full CV text in list view
    return {"status": "success", "data": students}

@app.post("/api/upload-cv")
async def upload_cv(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Only students can upload CVs.")

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

        raw_text = insights.pop("raw_text", "")

        profile_update = {
            "name": current_user["name"],
            "email": current_user["email"],
            "raw_text": raw_text,
            **insights
        }

        await db.students.update_one(
            {"email": current_user["email"]},
            {"$set": profile_update},
            upsert=True
        )

        await track_event(db, "cv_upload", {
            "student_email": current_user["email"],
            "skills_extracted": len(insights.get("skills", [])),
            "hireability_score": insights.get("hireability_score", 0)
        })

        return_data = {k: v for k, v in profile_update.items() if k != "raw_text"}
        return {"status": "parsed", "data": return_data}

    except Exception as e:
        if os.path.exists(file_location):
            os.remove(file_location)
        return {"status": "error", "message": f"Server error: {str(e)}"}

# ── Job Matching (student-facing) ─────────────────────────────────────────────
@app.get("/api/jobs/matches")
async def get_job_matches(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Only students can view job matches.")

    db = get_db()
    student = await db.students.find_one({"email": current_user["email"]})
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found. Please upload your CV first.")

    jobs_cursor = await db.jobs.find().to_list(100)
    for j in jobs_cursor:
        j["_id"] = str(j["_id"])

    if not student.get("skills"):
        # No skills yet — return all jobs unranked
        return {"status": "success", "data": jobs_cursor, "ranked": False}

    matched = await match_student_to_jobs(student, jobs_cursor)
    return {"status": "success", "data": matched, "ranked": True}

@app.get("/api/jobs/{job_id}/analyze")
async def analyze_job_match(
    job_id: str,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Only students can analyze job fit.")

    db = get_db()
    try:
        job = await db.jobs.find_one({"_id": ObjectId(job_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid job ID.")
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    job["_id"] = str(job["_id"])

    student = await db.students.find_one({"email": current_user["email"]})
    if not student:
        raise HTTPException(status_code=404, detail="Upload your CV first to get analysis.")

    analysis = await analyze_job_fit(student, job)
    return {"status": "success", "job": job, "analysis": analysis}

# ── Alumni Matches (student-facing) ───────────────────────────────────────────
@app.get("/api/alumni/matches")
async def get_alumni_matches(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Only students can view alumni matches.")

    db = get_db()
    student = await db.students.find_one({"email": current_user["email"]})
    alumni = await db.alumni.find().to_list(100)
    for a in alumni:
        a["_id"] = str(a["_id"])

    if not student or not student.get("skills"):
        return {"status": "success", "data": alumni}

    student_skills = [s.lower() for s in student.get("skills", [])]
    for a in alumni:
        expertise = [e.lower() for e in a.get("expertise", [])]
        overlap = len([e for e in expertise if any(e in sk or sk in e for sk in student_skills)])
        a["relevanceScore"] = min(100, overlap * 25)

    alumni.sort(key=lambda x: x.get("relevanceScore", 0), reverse=True)
    return {"status": "success", "data": alumni}

# ── Employer Semantic Search ───────────────────────────────────────────────────
@app.post("/api/semantic-search")
async def search_candidates(
    query: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] not in ["employer", "admin"]:
        raise HTTPException(status_code=403, detail="Only employers can search candidates.")

    db = get_db()
    await track_event(db, "employer_search", {
        "query": query,
        "employer": current_user["email"]
    })

    try:
        results = await semantic_multi_agent_search(query, db)
        return results
    except Exception as e:
        return {"status": "error", "message": f"Search failed: {str(e)}"}

# ── Admin Analytics ───────────────────────────────────────────────────────────
@app.get("/api/admin/analytics")
async def get_analytics(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access only.")
    db = get_db()
    summary = await get_analytics_summary(db)
    return {"status": "success", "data": summary}

@app.post("/api/admin/outcome")
async def record_student_outcome(
    student_id: str = Form(...),
    outcome: str = Form(...),
    employer: str = Form(""),
    job_title: str = Form(""),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] not in ["admin", "employer"]:
        raise HTTPException(status_code=403, detail="Access denied.")
    db = get_db()
    try:
        await db.students.update_one(
            {"_id": ObjectId(student_id)},
            {"$set": {
                "outcome": outcome,
                "outcome_employer": employer,
                "outcome_job_title": job_title
            }}
        )
        await track_event(db, "outcome_recorded", {
            "student_id": student_id,
            "outcome": outcome,
            "employer": employer
        })
        return {"status": "success", "message": f"Outcome '{outcome}' recorded."}
    except Exception as e:
        return {"status": "error", "message": str(e)}