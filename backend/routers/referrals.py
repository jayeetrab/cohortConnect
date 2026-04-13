from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from bson import ObjectId
from database import get_db
from auth import get_current_user
from agents.referral_agent import find_best_alumni_for_job, draft_referral_email
from agents.analytics import track_event
from datetime import datetime

router = APIRouter(prefix="/api/referrals", tags=["referrals"])


class DraftRequest(BaseModel):
    student_id: str
    job_id: str
    alumni_id: Optional[str] = None


class ApprovalRequest(BaseModel):
    referral_id: str
    approved_email: str
    action: str  # "approve" or "reject"


class OutcomeRequest(BaseModel):
    student_id: str
    outcome: str  # "interview", "offer", "placed", "rejected"
    employer: Optional[str] = ""
    job_title: Optional[str] = ""


@router.post("/draft")
async def draft_referral(
    payload: DraftRequest,
    current_user: dict = Depends(get_current_user)
):
    """Employer or student triggers referral drafting for a student + job pair."""
    if current_user["role"] not in ["employer", "admin", "student"]:
        raise HTTPException(status_code=403, detail="Access denied.")

    db = get_db()

    # Fetch student by email (more reliable across collections)
    student = await db.students.find_one({"email": current_user["email"]})
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found. Please upload your CV first.")
    
    student_id_str = str(student["_id"])
    student["_id"] = student_id_str

    # Fetch job
    try:
        job = await db.jobs.find_one({"_id": ObjectId(payload.job_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid job ID.")
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    job["_id"] = str(job["_id"])

    # Find alumni
    if payload.alumni_id:
        try:
            top_alumni = await db.alumni.find_one({"_id": ObjectId(payload.alumni_id)})
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid alumni ID.")
        if not top_alumni:
            raise HTTPException(status_code=404, detail="Selected alumni not found.")
        top_alumni["_id"] = str(top_alumni["_id"])
    else:
        # Fallback to best matching alumni
        best_alumni = await find_best_alumni_for_job(job, db)
        if not best_alumni:
            raise HTTPException(
                status_code=404,
                detail="No alumni found in the network yet. Add alumni profiles first."
            )
        top_alumni = best_alumni[0]

    # Draft the email
    drafted_email = await draft_referral_email(student, top_alumni, job)

    # Save referral record to DB
    referral_record = {
        "student_id": payload.student_id,
        "student_name": student.get("name"),
        "student_email": student.get("email"),
        "job_id": payload.job_id,
        "job_title": job.get("title"),
        "company": job.get("company"),
        "alumni_id": str(top_alumni.get("_id")),
        "alumni_name": top_alumni.get("name"),
        "alumni_email": top_alumni.get("email", ""),
        "alumni_role": top_alumni.get("role"),
        "alumni_company": top_alumni.get("company"),
        "drafted_email": drafted_email,
        "status": "pending",
        "created_at": datetime.utcnow(),
        "employer_email": current_user["email"] if current_user["role"] == "employer" else None,
        "initiated_by": current_user["role"]
    }
    result = await db.referrals.insert_one(referral_record)
    referral_id = str(result.inserted_id)

    await track_event(db, "referral_drafted", {
        "referral_id": referral_id,
        "student_id": payload.student_id,
        "job_id": payload.job_id,
        "alumni_id": str(top_alumni.get("_id")),
        "employer": current_user["email"]
    })

    return {
        "status": "success",
        "referral_id": referral_id,
        "student": {
            "id": payload.student_id,
            "name": student.get("name"),
            "email": student.get("email")
        },
        "job": {
            "id": payload.job_id,
            "title": job.get("title"),
            "company": job.get("company")
        },
        "alumni": {
            "name": top_alumni.get("name"),
            "role": top_alumni.get("role"),
            "company": top_alumni.get("company"),
            "relevance_score": top_alumni.get("relevance_score", 0)
        },
        "drafted_email": drafted_email
    }


@router.post("/approve")
async def approve_referral(
    payload: ApprovalRequest,
    current_user: dict = Depends(get_current_user)
):
    """Employer or admin finalises the referral email (approve or reject)."""
    if current_user["role"] not in ["employer", "admin"]:
        raise HTTPException(status_code=403, detail="Access denied.")

    db = get_db()
    try:
        ref = await db.referrals.find_one({"_id": ObjectId(payload.referral_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid referral ID.")
    if not ref:
        raise HTTPException(status_code=404, detail="Referral not found.")

    new_status = "approved" if payload.action == "approve" else "rejected"
    await db.referrals.update_one(
        {"_id": ObjectId(payload.referral_id)},
        {"$set": {
            "status": new_status,
            "final_email": payload.approved_email,
            "actioned_at": datetime.utcnow(),
            "actioned_by": current_user["email"]
        }}
    )

    event_type = "referral_approved" if payload.action == "approve" else "referral_rejected"
    await track_event(db, event_type, {
        "referral_id": payload.referral_id,
        "actioned_by": current_user["email"]
    })

    return {
        "status": "success",
        "message": f"Referral {new_status} successfully.",
        "referral_id": payload.referral_id
    }


@router.get("/my")
async def get_my_referrals(current_user: dict = Depends(get_current_user)):
    """Get referrals relevant to the current user (by role)."""
    db = get_db()
    query = {}

    if current_user["role"] == "employer":
        query = {"employer_email": current_user["email"]}
    elif current_user["role"] == "student":
        query = {"student_email": current_user["email"]}
    elif current_user["role"] == "alumni":
        query = {"alumni_email": current_user["email"]}
    elif current_user["role"] == "admin":
        query = {}
    else:
        raise HTTPException(status_code=403, detail="Access denied.")

    referrals = await db.referrals.find(query).sort("created_at", -1).to_list(50)
    for r in referrals:
        r["_id"] = str(r["_id"])
        if "created_at" in r:
            r["created_at"] = r["created_at"].isoformat()
        if "actioned_at" in r:
            r["actioned_at"] = r["actioned_at"].isoformat()

    return {"status": "success", "data": referrals}


@router.post("/outcome")
async def record_outcome(
    payload: OutcomeRequest,
    current_user: dict = Depends(get_current_user)
):
    """Record a placement outcome for a student (admin or employer)."""
    if current_user["role"] not in ["admin", "employer"]:
        raise HTTPException(status_code=403, detail="Access denied.")

    db = get_db()
    await db.students.update_one(
        {"_id": ObjectId(payload.student_id)},
        {"$set": {
            "outcome": payload.outcome,
            "outcome_employer": payload.employer,
            "outcome_job_title": payload.job_title,
            "outcome_recorded_at": datetime.utcnow().isoformat()
        }}
    )
    await track_event(db, "outcome_recorded", {
        "student_id": payload.student_id,
        "outcome": payload.outcome,
        "employer": payload.employer,
        "recorded_by": current_user["email"]
    })
    return {"status": "success", "message": f"Outcome '{payload.outcome}' recorded."}