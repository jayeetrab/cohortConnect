from pydantic import BaseModel, Field
from typing import List, Optional
from bson import ObjectId
from enum import Enum

class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return str(v)

class UserRole(str, Enum):
    student = "student"
    employer = "employer"
    alumni = "alumni"
    admin = "admin"

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: UserRole

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str

class StudentProfile(BaseModel):
    name: str = "Student User"
    email: str = ""
    skills: List[str] = []
    projects: List[str] = []
    experience: List[str] = []
    domain_competency: str = ""
    hireability_score: int = 0
    improvement_feedback: List[str] = []
    cv_text: str = ""
    raw_text: str = ""

class CVExtraction(BaseModel):
    skills: List[str]
    projects: List[str]
    experience: List[str]
    domain_competency: str
    hireability_score: int
    improvement_feedback: List[str]

class JobPosting(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id")
    title: str
    company: str
    description: str
    required_skills: List[str]
    location: str

class Alumni(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id")
    name: str
    role: str
    company: str
    graduation_year: int
    expertise: List[str]
    email: Optional[str] = ""

class ReferralDraftRequest(BaseModel):
    student_id: str
    job_id: str

class ReferralApproval(BaseModel):
    referral_id: str
    approved_email: str
    action: str  # "approve" or "reject"

class OutcomeUpdate(BaseModel):
    student_id: str
    outcome: str  # "interview", "offer", "rejected", "placed"
    employer: Optional[str] = ""
    job_title: Optional[str] = ""