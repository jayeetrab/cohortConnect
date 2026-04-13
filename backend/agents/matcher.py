from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Load a fast, lightweight semantic model
# This runs locally and generates semantic embeddings for our vectors.
model = SentenceTransformer('all-MiniLM-L6-v2')

def encode_vector(text_list: list[str]) -> np.ndarray:
    """Encodes a list of strings into a single average semantic vector."""
    if not text_list:
        return np.zeros((384,)) # all-MiniLM-L6-v2 embedding dimension
    # Create one continuous string describing the capabilities
    combined_text = ", ".join(text_list)
    return model.encode([combined_text])[0]

def compute_similarity(source_vector: np.ndarray, target_vectors: list[np.ndarray]) -> list[float]:
    """Computes cosine similarity between source and multiple targets."""
    if not target_vectors:
        return []
    
    # Cosine similarity expects 2D arrays
    source_2d = source_vector.reshape(1, -1)
    targets_2d = np.array(target_vectors)
    
    similarities = cosine_similarity(source_2d, targets_2d)[0]
    return similarities.tolist()

def calculate_match_scores(student_skills: list[str], targets: list[dict], target_key: str) -> list[dict]:
    """
    Given a list of student skills and a list of targets (jobs or alumni),
    calculates the semantic similarity score for each target.
    `target_key` is 'required_skills' for jobs, and 'expertise' for alumni.
    """
    if not student_skills or not targets:
        return targets

    student_vec = encode_vector(student_skills)
    
    # Extract target capability strings
    target_skill_lists = [t.get(target_key, []) for t in targets]
    target_vecs = [encode_vector(skl) for skl in target_skill_lists]
    
    scores = compute_similarity(student_vec, target_vecs)
    
    for idx, target in enumerate(targets):
        # Cosine similarity ranges from -1 to 1. We'll map mostly 0.2->1.0 to a nice percentage.
        # Ensure it scales to 100%. Max is 1.0.
        raw_score = scores[idx]
        
        if raw_score <= 0.1: 
            match_score = 0
        else:
            # Map [0.1, 1.0] to [0, 100] with a curve
            match_score = min(100.0, max(0.0, (raw_score - 0.1) * (100 / 0.9)))
            
        target["matchScore"] = match_score
        
    return targets
