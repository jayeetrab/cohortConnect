import os
import json
from langchain_google_genai import ChatGoogleGenerativeAI

async def find_best_alumni_for_job(job: dict, db) -> list:
    """Find the top 3 alumni whose expertise best matches the job."""
    alumni = await db.alumni.find().to_list(100)
    if not alumni:
        return []

    required_skills = [s.lower() for s in job.get("required_skills", [])]
    job_company = job.get("company", "").lower()

    scored = []
    for a in alumni:
        expertise = [e.lower() for e in a.get("expertise", [])]
        skill_overlap = len([e for e in expertise if any(e in r or r in e for r in required_skills)])
        # Bonus: alumni who work at the same company
        company_bonus = 20 if a.get("company", "").lower() == job_company else 0
        score = min(100, skill_overlap * 20 + company_bonus)
        scored.append({**a, "_id": str(a["_id"]), "relevance_score": score})

    scored.sort(key=lambda x: x["relevance_score"], reverse=True)
    return scored[:3]


async def draft_referral_email(student: dict, alumni: dict, job: dict) -> str:
    """Use Gemini to draft a warm referral email from careers team to alumni."""
    if not os.getenv("GOOGLE_API_KEY"):
        # Fallback template
        return f"""Dear {alumni.get('name')},

I hope this message finds you well. I'm reaching out from the University of Bristol Careers Team regarding one of our exceptional MSc students, {student.get('name')}.

{student.get('name')} is currently applying for the {job.get('title')} position at {job.get('company')} and, given your experience as {alumni.get('role')} at {alumni.get('company')}, we thought you might be perfectly placed to offer a connection or referral.

Their key strengths include: {', '.join(student.get('skills', [])[:4])}. They have a hireability score of {student.get('hireability_score', 'N/A')}/100 on our platform.

Would you be open to a brief 15-minute call, a LinkedIn connection, or a referral if you feel they are a strong fit? Your support would make a meaningful difference to their career journey.

With warm regards,
University of Bristol Careers & Employability Team"""

    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.4)
    prompt = f"""Draft a warm, professional referral request email on behalf of the University of Bristol Careers Team.

FROM: University of Bristol Careers & Employability Team
TO: {alumni.get('name')}, {alumni.get('role')} at {alumni.get('company')} (Bristol alumnus, graduated {alumni.get('graduation_year')})
RE: {student.get('name')}, current Bristol MSc student applying for {job.get('title')} at {job.get('company')}

Student profile:
- Skills: {', '.join(student.get('skills', []))}
- Projects: {', '.join(student.get('projects', [])[:2])}
- Experience: {', '.join(student.get('experience', [])[:2])}
- Domain: {student.get('domain_competency')}
- Hireability Score: {student.get('hireability_score')}/100

Alumni expertise: {', '.join(alumni.get('expertise', []))}

Write exactly 3 short paragraphs:
1. Introduce the student and their strongest 2-3 skills
2. Why they fit {job.get('title')} at {job.get('company')} specifically
3. A low-friction ask: 15-min call, LinkedIn connection, or referral if they see fit

Tone: warm, concise, respectful of the alumni's time. Under 180 words total. Use a proper email format with greeting and sign-off."""

    try:
        res = await llm.ainvoke(prompt)
        return res.content.strip()
    except Exception as e:
        return f"Email drafting failed: {str(e)}"


async def analyze_job_fit(student: dict, job: dict) -> dict:
    """Deep per-job analysis for the student dashboard."""
    if not os.getenv("GOOGLE_API_KEY"):
        student_skills = [s.lower() for s in student.get("skills", [])]
        required = job.get("required_skills", [])
        missing = [r for r in required if r.lower() not in student_skills]
        return {
            "matchReason": f"You have {len(required) - len(missing)} of {len(required)} required skills.",
            "missingSkills": missing,
            "recommendedCourses": [f"Search Coursera for: {s}" for s in missing[:2]],
            "hireabilityAdvice": "Upload your CV with GOOGLE_API_KEY configured for detailed AI analysis."
        }

    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.2)
    prompt = f"""You are an expert AI Career Coach at the University of Bristol.

Job Details:
Title: {job.get('title')}
Company: {job.get('company')}
Description: {job.get('description')}
Required Skills: {', '.join(job.get('required_skills', []))}

Candidate:
Skills: {', '.join(student.get('skills', []))}
Experience: {', '.join(student.get('experience', []))}
Projects: {', '.join(student.get('projects', []))}
Domain: {student.get('domain_competency')}

Return JSON only:
{{
  "matchReason": "<2-3 sentence explanation of fit>",
  "missingSkills": ["skill1", "skill2"],
  "recommendedCourses": ["Course title 1 on Coursera", "Course title 2"],
  "hireabilityAdvice": "<one actionable tip specific to this job>"
}}"""

    try:
        res = await llm.ainvoke(prompt)
        content = res.content.strip().lstrip("```json").rstrip("```").strip()
        return json.loads(content)
    except Exception as e:
        return {
            "matchReason": "Analysis failed.",
            "missingSkills": [],
            "recommendedCourses": [],
            "hireabilityAdvice": str(e)
        }