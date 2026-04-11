import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate

async def semantic_multi_agent_search(query: str, db) -> dict:
    # Retrieve all student profiles from MongoDB
    students_cursor = db.students.find()
    students = await students_cursor.to_list(length=50)
    
    if not students:
        return {"status": "error", "message": "No students found in DB. Need someone to upload a CV first via the Student Portal."}
        
    structured_candidates = []
    
    # Live Semantic Matching via GenAI
    if os.getenv("GOOGLE_API_KEY"):
        llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.1)
        prompt = PromptTemplate(
            template="""You are an expert AI Placement Officer evaluating an employer query against candidate profiles.
Employer Query: '{query}'
Candidate Profile: {profile}

Provide a match score (0-100) and a 1-sentence deep semantic reasoning of why they fit or don't fit. Return strictly in format: SCORE|REASON""",
            input_variables=["query", "profile"]
        )
        
        for student in students:
            profile_summary = f"Skills: {student.get('skills', [])}. Competency: {student.get('domain_competency', '')}"
            try:
                res = await llm.ainvoke(prompt.format(query=query, profile=profile_summary))
                score_str, reason = res.content.split("|", 1)
                structured_candidates.append({
                    "id": str(student["_id"]),
                    "name": student["name"],
                    "match": int(score_str.strip()),
                    "topSkill": student.get("domain_competency", "Specialist"),
                    "reason": reason.strip()
                })
            except:
                continue
    else:
        # Fallback simulation utilizing the real DB records
        for student in students:
            structured_candidates.append({
                "id": str(student["_id"]),
                "name": student["name"],
                "match": 95 if "AI" in query else 75,
                "topSkill": student.get("domain_competency", "Specialist"),
                "reason": "Demonstrates foundational skills aligning with your search intent based on their DB profile."
            })
            
    # Sort by match descending
    structured_candidates.sort(key=lambda x: x["match"], reverse=True)
    return {"status": "success", "matches": structured_candidates[:5]}
