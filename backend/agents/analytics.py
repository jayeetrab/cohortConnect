from datetime import datetime, timedelta


async def track_event(db, event_type: str, data: dict):
    """Write a tracking event to MongoDB."""
    try:
        await db.events.insert_one({
            "event_type": event_type,
            "timestamp": datetime.utcnow(),
            "data": data
        })
    except Exception as e:
        print(f"Analytics tracking error: {e}")


async def get_analytics_summary(db) -> dict:
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    total_students = await db.students.count_documents({})
    students_with_cv = await db.students.count_documents(
        {"raw_text": {"$exists": True, "$ne": ""}}
    )
    total_employers = await db.users.count_documents({"role": "employer"})
    total_alumni = await db.alumni.count_documents({})

    searches_week = await db.events.count_documents({
        "event_type": "employer_search",
        "timestamp": {"$gte": week_ago}
    })
    cv_uploads_month = await db.events.count_documents({
        "event_type": "cv_upload",
        "timestamp": {"$gte": month_ago}
    })
    referrals_drafted = await db.events.count_documents(
        {"event_type": "referral_drafted"}
    )
    referrals_approved = await db.events.count_documents(
        {"event_type": "referral_approved"}
    )

    # Placement outcomes
    placed = await db.students.count_documents({"outcome": "placed"})
    interviewed = await db.students.count_documents({"outcome": "interview"})
    offered = await db.students.count_documents({"outcome": "offer"})

    referral_conversion = (
        round((referrals_approved / referrals_drafted) * 100)
        if referrals_drafted > 0 else 0
    )
    placement_rate = (
        round((placed / total_students) * 100)
        if total_students > 0 else 0
    )
    cv_completion = (
        round((students_with_cv / total_students) * 100)
        if total_students > 0 else 0
    )

    # Aggregate top skills from employer search events
    search_events = await db.events.find(
        {"event_type": "employer_search"}
    ).to_list(200)
    all_query_words = []
    for ev in search_events:
        query = ev.get("data", {}).get("query", "")
        words = [w.strip(".,").lower() for w in query.split() if len(w) > 3]
        all_query_words.extend(words)

    from collections import Counter
    top_words = Counter(all_query_words).most_common(8)
    top_skills_demand = [{"skill": w, "count": c} for w, c in top_words]

    # Recent activity feed
    recent_events = await db.events.find(
        {}, {"_id": 0}
    ).sort("timestamp", -1).to_list(10)
    for ev in recent_events:
        if "timestamp" in ev:
            ev["timestamp"] = ev["timestamp"].isoformat()

    return {
        "overview": {
            "total_students": total_students,
            "students_with_cv": students_with_cv,
            "total_employers": total_employers,
            "total_alumni": total_alumni,
            "cv_completion_pct": cv_completion,
        },
        "activity": {
            "searches_this_week": searches_week,
            "cv_uploads_this_month": cv_uploads_month,
            "referrals_drafted": referrals_drafted,
            "referrals_approved": referrals_approved,
        },
        "outcomes": {
            "placed": placed,
            "interviewed": interviewed,
            "offered": offered,
            "placement_rate_pct": placement_rate,
            "referral_conversion_pct": referral_conversion,
        },
        "pilot_targets": {
            "student_target": 45,
            "employer_target": 5,
            "referral_ambition_pct": 50,
            "placement_ambition_pct": 80,
            "student_progress_pct": min(100, round((total_students / 45) * 100)),
            "employer_progress_pct": min(100, round((total_employers / 5) * 100)),
        },
        "top_skills_in_demand": top_skills_demand,
        "recent_activity": recent_events,
    }