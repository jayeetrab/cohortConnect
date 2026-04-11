import google.generativeai as genai
import numpy as np
from core.config import settings

# Configure Gemini for Embeddings
genai.configure(api_key=settings.GOOGLE_API_KEY)

def get_embedding(text: str) -> np.ndarray:
    """Generates a semantic embedding vector using Gemini's remote API."""
    if not text or not settings.GOOGLE_API_KEY:
        return np.zeros(768) # Default dimension for text-embedding-004
    
    try:
        result = genai.embed_content(
            model="models/text-embedding-004",
            content=text,
            task_type="retrieval_document"
        )
        return np.array(result['embedding'])
    except Exception as e:
        print(f"Gemini Embedding Error: {e}")
        return np.zeros(768)

def cosine_similarity(v1: np.ndarray, v2: np.ndarray) -> float:
    """Manual cosine similarity calculation to avoid scikit-learn dependency."""
    dot = np.dot(v1, v2)
    norm_v1 = np.linalg.norm(v1)
    norm_v2 = np.linalg.norm(v2)
    if norm_v1 == 0 or norm_v2 == 0:
        return 0.0
    return float(dot / (norm_v1 * norm_v2))

def calculate_match_scores(student_skills: list[str], targets: list[dict], target_key: str) -> list[dict]:
    """
    Calculates semantic similarity using Gemini Embeddings.
    More accurate and lightweight (API-based) than local sentence-transformers.
    """
    if not student_skills or not targets or not settings.GOOGLE_API_KEY:
        for t in targets: t["matchScore"] = 0
        return targets

    # Create a contextual summary for the student to improve match quality
    student_context = f"A professional with skills in: {', '.join(student_skills)}"
    student_vec = get_embedding(student_context)
    
    for target in targets:
        target_skills = target.get(target_key, [])
        # Also include title/role for better semantic context
        target_title = target.get('title' if 'title' in target else 'role', '')
        target_context = f"{target_title}. Requirements: {', '.join(target_skills)}"
        
        target_vec = get_embedding(target_context)
        similarity = cosine_similarity(student_vec, target_vec)
        
        # Mapping similarity [0.2 - 0.9] to [0 - 100]
        if similarity < 0.35:
            score = 0.0
        else:
            score = min(100.0, max(0.0, (similarity - 0.35) * (100 / 0.55)))
            
        target["matchScore"] = round(float(score), 1)
        
    # Sort by matchScore descending
    targets.sort(key=lambda x: x.get("matchScore", 0), reverse=True)
    return targets
