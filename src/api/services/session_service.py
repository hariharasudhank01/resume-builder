"""
This Scripts create new session for every run triggered from 
the front end.
"""
from uuid import uuid4
from api.schemas.session import JobInput, RequirementGroup, SessionResponse
from datetime import datetime, timezone
from api import store

def create_session(job_input: JobInput) -> SessionResponse:
    """
    This function creates new session for every run triggered from
    the front end and saves the session temp in _sessions dict in store.py.

    Arguments:
        - job_input: JobInput, JD entered from the front end.
    Returns:
        - SessionResponse: new session created with session details
    """

    # This is mock requirements used for initial API run. 
    # Soon will be replaced by LLM call that extracts the requirements from the provided JD.
    requirements = [
        RequirementGroup(key="required", label="Required skills", items=["AWS", "Python", "Java"]),
        RequirementGroup(key="preferred", label="Preferred skills", items=["SQL", "DevOps"]),
        RequirementGroup(key="responsibilities", label="Responsibilities", items=["Data pipeline"]),
    ]

    session = SessionResponse(
        id=str(uuid4()), # Session ID
        job=job_input, # Job Details
        requirements=requirements, # Extracted Job Requirements
        created_at=datetime.now(timezone.utc), # Created Time
    )

    # Temp stores the session
    store.save_session(session)
    return session

def get_session(session_id: str) -> SessionResponse | None:
    """
    This function gets the session based on the provided session ID.

    Arguments:
        - session_id: int, Session ID of requested session
    Returns:
        - SessionResponse, actual session
        - None
    """
    return store.get_session(session_id)
