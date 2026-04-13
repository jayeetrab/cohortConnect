import os
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate

async def semantic_multi_agent_search(query: str, db) -> dict:
    students_cursor = db.students.find()
    students = await students_cursor.to_list(length=100)

    if not students:
        return {
            "status": "error",
            "message": "No student profiles found. Students must upload their CVs first."
        }

    structured_candidates = []

    if os.getenv("GOOGLE_API_KEY"):
        llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.1)
        prompt = PromptTemplate(
            template="""You are an expert AI Placement Officer at the University of Bristol.

Employer Query: '{query}'

Candidate Profile:
Name: {name}
Skills: {skills}
Projects: {projects}
Experience: {experience}
Domain Competency: {domain}
Hireability Score: {score}/100
CV Summary: {cv_summary}

Evaluate this candidate against the employer query.
Return a JSON object with EXACTLY these fields:
{{
  "match": <integer 0-100>,
  "reason": "<2 sentence explanation of overall fit>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "gaps": ["<gap 1>", "<gap 2>"]
}}
Return only valid JSON, no markdown fences.""",
            input_variables=["query", "name", "skills", "projects", "experience", "domain", "score", "cv_summary"]
        )

        for student in students:
            cv_summary = student.get("raw_text", "")[:600]
            try:
                res = await llm.ainvoke(prompt.format(
                    query=query,
                    name=student.get("name", ""),
                    skills=", ".join(student.get("skills", [])),
                    projects=", ".join(student.get("projects", [])),
                    experience=", ".join(student.get("experience", [])),
                    domain=student.get("domain_competency", ""),
                    score=student.get("hireability_score", 0),
                    cv_summary=cv_summary
                ))
                content = res.content.strip()
                if content.startswith("```"):
                    content = content.split("```")[1]
                    if content.startswith("json"):
                        content = content[4:]
                data = json.loads(content)
                structured_candidates.append({
                    "id": str(student["_id"]),
                    "name": student["name"],
                    "email": student.get("email", ""),
                    "match": int(data.get("match", 0)),
                    "topSkill": student.get("domain_competency", "Specialist"),
                    "reason": data.get("reason", ""),
                    "strengths": data.get("strengths", []),
                    "gaps": data.get("gaps", []),
                    "hireability_score": student.get("hireability_score", 0)
                })
            except Exception as e:
                print(f"Matching error for {student.get('name')}: {e}")
                structured_candidates.append({
                    "id": str(student["_id"]),
                    "name": student["name"],
                    "email": student.get("email", ""),
                    "match": 50,
                    "topSkill": student.get("domain_competency", "Specialist"),
                    "reason": "Profile available but AI analysis failed. Review manually.",
                    "strengths": student.get("skills", [])[:3],
                    "gaps": ["AI analysis unavailable"],
                    "hireability_score": student.get("hireability_score", 0)
                })
    else:
        # Fallback — no API key
        for student in students:
            skills = student.get("skills", [])
            query_lower = query.lower()
            matched = [s for s in skills if s.lower() in query_lower]
            score = min(95, 40 + len(matched) * 15)
            structured_candidates.append({
                "id": str(student["_id"]),
                "name": student["name"],
                "email": student.get("email", ""),
                "match": score,
                "topSkill": student.get("domain_competency", "Specialist"),
                "reason": f"Keyword overlap found with {len(matched)} matching skills. Enable GOOGLE_API_KEY for full semantic analysis.",
                "strengths": skills[:3],
                "gaps": ["Full semantic analysis requires GOOGLE_API_KEY"],
                "hireability_score": student.get("hireability_score", 0)
            })

    structured_candidates.sort(key=lambda x: x["match"], reverse=True)
    return {"status": "success", "matches": structured_candidates[:10]}


async def match_student_to_jobs(student: dict, jobs: list) -> list:
    """Score all jobs against a student profile for the student dashboard."""
    if not jobs:
        return []

    if not os.getenv("GOOGLE_API_KEY"):
        # Fallback keyword matching
        results = []
        student_skills = [s.lower() for s in student.get("skills", [])]
        for job in jobs:
            required = [r.lower() for r in job.get("required_skills", [])]
            overlap = len([r for r in required if any(r in sk or sk in r for sk in student_skills)])
            score = min(95, int((overlap / max(len(required), 1)) * 100))
            results.append({
                **job,
                "matchScore": score,
                "matchReason": f"{overlap} of {len(required)} required skills matched.",
                "missingSkills": [r for r in job.get("required_skills", [])
                                  if r.lower() not in student_skills][:3]
            })
        results.sort(key=lambda x: x["matchScore"], reverse=True)
        return results

    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.1)
    results = []
    for job in jobs:
        prompt = f"""You are a career coach. Assess this student's fit for the job.

Student Skills: {', '.join(student.get('skills', []))}
Student Experience: {', '.join(student.get('experience', []))}
Student Domain: {student.get('domain_competency', '')}

Job Title: {job.get('title')}
Company: {job.get('company')}
Required Skills: {', '.join(job.get('required_skills', []))}
Description: {job.get('description', '')}

Return JSON only:
{{
  "matchScore": <0-100>,
  "matchReason": "<1 sentence>",
  "missingSkills": ["skill1", "skill2"]
}}"""
        try:
            res = await llm.ainvoke(prompt)
            content = res.content.strip().lstrip("```json").rstrip("```").strip()
            data = json.loads(content)
            results.append({**job, **data})
        except Exception:
            results.append({
                **job,
                "matchScore": 40,
                "matchReason": "Analysis unavailable.",
                "missingSkills": []
            })

    results.sort(key=lambda x: x.get("matchScore", 0), reverse=True)
    return results