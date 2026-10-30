"""
This function returns the Evidence fetched from the knowledge base related to the
Job requirement to the Front end.
"""
from api.schemas.evidence import Evidence, EvidenceResponse, MissingEvidence
from api.schemas.session import SessionResponse

# This is just a mock data. Will be replaced by actual logic
KNOWLEDGE_BASE = [
    {
        "id": "PRJ-WAREHOUSE",
        "title": "Built an analytics warehouse with dbt",
        "source": "projects",
        "file": "projects.md",
        "section": "Analytics warehouse",
        "text": "Modelled raw e-commerce data into a star schema using dbt and SQL.",
        "skills": ["SQL", "Data pipeline"],
        "status": "confirmed_by_user",
    },
    {
        "id": "WEX-ETL",
        "title": "Built an event-triggered ETL pipeline",
        "source": "work_experience",
        "file": "work_experience.md",
        "section": "Graduate engineer",
        "text": "Wrote a Python ETL job that ran on every release and produced a report.",
        "skills": ["Python", "Data pipeline"],
        "status": "confirmed_by_user",
    },
    {
        "id": "CERT-AWS",
        "title": "AWS Certified Cloud Practitioner",
        "source": "general",
        "file": "general.md",
        "section": "Certifications",
        "text": "Passed the AWS Cloud Practitioner exam.",
        "skills": ["AWS"],
        "status": "needs_confirmation",
    },   
]

def get_evidence(session: SessionResponse, limit: int) -> EvidenceResponse:
    """
    This function returns the Evidence that matches the skills required in the provided job
    description.

    Arguments:
        - session: SessionResponse, this argument contains the session details along with the
                    Job requirement
        - limit: int, number of evidence needs to be shared. Eg: Top N evidences
    Returns:
        - EvidenceResponse, evidence details
    """
    requirements = [item for group in session.requirements for item in group.items]

    evidence: list[Evidence] = []
    for entry in KNOWLEDGE_BASE:
        entry_skills = {skill.lower() for skill in entry["skills"]}
        matched = [req for req in requirements if req.lower() in entry_skills]
        if not matched:
            continue
        evidence.append(
            Evidence(
                id=entry["id"], # Evidence ID from knowledge base
                title=entry["title"], # Evidence title from knowledge base
                source=entry["source"], # Evidence source
                file=entry["file"], # Evidence file
                section=entry["section"], # Evidence Section
                text=entry["text"], # Evidence
                status=entry["status"],
                requirements=matched, # Matched skills
                relevance=min(100, 50 + 20 * len(matched)), # How much percent of skills covered
                why=f"Mentions {', '.join(matched)}", # Reason
            )
        )

    covered = {req for item in evidence for req in item.requirements}
    # If no Evidence match the requirements
    missing = [
        MissingEvidence(requirement=req, message=f"Nothing in your knowledge base mentions {req}.")
        for req in requirements
        if req not in covered
    ]

    # Sort the Evidence based on the relevance and return top N evidence based on limit
    evidence.sort(key=lambda item: item.relevance, reverse=True)
    return EvidenceResponse(session_id=session.id, evidence=evidence[:limit], missing_evidence=missing)