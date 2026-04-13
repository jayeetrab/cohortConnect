import pypdf
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from models import CVExtraction

async def extract_cv_insights(file_path: str) -> dict:
    try:
        reader = pypdf.PdfReader(file_path)
        text = "\n".join([
            page.extract_text() for page in reader.pages
            if page.extract_text()
        ])

        if not text.strip():
            return {"error": "Could not extract text from PDF. Please ensure it is not a scanned image."}

        from core.config import settings

        if settings.GOOGLE_API_KEY:
            os.environ["GOOGLE_API_KEY"] = settings.GOOGLE_API_KEY
            llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.1)
            parser = PydanticOutputParser(pydantic_object=CVExtraction)
            prompt = PromptTemplate(
                template=(
                    "You are the University of Bristol's AI Placement Officer. "
                    "Parse the following CV and extract:\n"
                    "- skills: all technical and soft skills\n"
                    "- projects: project names and one-line descriptions\n"
                    "- experience: work experience entries (company, role, duration)\n"
                    "- domain_competency: the strongest single domain (e.g. 'AI & Machine Learning')\n"
                    "- hireability_score: integer 0-100 based on depth of skills and experience\n"
                    "- improvement_feedback: 2-3 specific, actionable tips to improve their profile\n\n"
                    "{format_instructions}\n\nCV:\n{text}"
                ),
                input_variables=["text"],
                partial_variables={"format_instructions": parser.get_format_instructions()}
            )
            chain = prompt | llm | parser
            result = await chain.ainvoke({"text": text})
            parsed = result.model_dump()
            parsed["raw_text"] = text
            return parsed
        else:
            # Fallback: basic keyword extraction
            skills = []
            skill_keywords = ["python", "react", "sql", "aws", "docker", "machine learning",
                              "fastapi", "mongodb", "typescript", "java", "langchain", "pytorch"]
            for kw in skill_keywords:
                if kw in text.lower():
                    skills.append(kw.title())

            return {
                "skills": skills or ["Python", "Communication"],
                "projects": ["Extracted from CV (enable GOOGLE_API_KEY for detailed extraction)"],
                "experience": ["Extracted from CV (enable GOOGLE_API_KEY for detailed extraction)"],
                "domain_competency": "General Engineering",
                "hireability_score": 60,
                "improvement_feedback": [
                    "Add a GOOGLE_API_KEY to enable full AI-powered CV analysis.",
                    "Ensure your CV is in text-based PDF format."
                ],
                "raw_text": text
            }

    except Exception as e:
        return {"error": str(e)}