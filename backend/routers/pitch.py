from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter(prefix="/api/pitch", tags=["pitch"])

@router.get("/")
async def get_pitch_data():
    """
    Returns the strategic slide data for the University of Bristol Pitch Deck.
    This centralized API ensures the vision is consistent and data-driven.
    """
    return {
        "status": "success",
        "branding": {
            "university": "University of Bristol",
            "motto": "Vim Promovet Insitam",
            "colors": {
                "primary": "#DC2626", # Bristol Red
                "secondary": "#1E293B"
            }
        },
        "engine_version": "2.5.0-v2-flash",
        "slides": [
            {
                "id": 1,
                "title": "The Bristol Talent Catalyst",
                "subtitle": "Bridging the gap between world-class education and global industry leadership.",
                "type": "title"
            },
            {
                "id": 2,
                "title": "The Fragmentation Crisis",
                "subtitle": "The existing student-employer connection is broken and keyword-dependent.",
                "type": "problem"
            },
            {
                "id": 3,
                "title": "Predictive Career Alignment",
                "subtitle": "Moving beyond basic profiles to real-time Hireability Scoring.",
                "type": "analysis"
            },
            {
                "id": 4,
                "title": "Smart CV Enhancement",
                "subtitle": "Gemini-powered feedback to align every student with high-tier roles.",
                "type": "ai_mentor"
            },
            {
                "id": 5,
                "title": "Natural Language Talent Discovery",
                "subtitle": "Empowering Bristol Employers with semantic search capabilities.",
                "type": "search"
            },
            {
                "id": 6,
                "title": "The Vision for Bristol",
                "subtitle": "Elevating the employment prestige of the University of Bristol globally.",
                "type": "impact"
            }
        ],
        "impact_metrics": {
            "hireability_boost": "+45%",
            "mentorship_count": "6.2k",
            "placement_velocity": "2.4x",
            "security": "Institution Verified"
        }
    }
