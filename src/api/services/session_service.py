from uuid import uuid4
from api.schemas.session import JobInput, RequirementGroup, SessionResponse
from datetime import datetime, timezone
from api import store

def create_session(job_input: JobInput) -> SessionResponse:
    requirements = [
        RequirementGroup(key="required", label="Required skills", items=["AWS", "Python", "Java"]),
        RequirementGroup(key="preferred", label="Preferred skills", items=["SQL", "DevOps"]),
        RequirementGroup(key="responsibilities", label="Responsibilities", items=["Data pipeline"]),
    ]

    session = SessionResponse(
        id=str(uuid4()),
        job=job_input,
        requirements=requirements,
        created_at=datetime.now(timezone.utc),
    )
    store.save_session(session)
    return session

def get_session(session_id: str) -> SessionResponse | None:
    return store.get_session(session_id)
