"""
This Script defines the API Router for Job Description UI page.
"""
from fastapi import APIRouter, HTTPException
from api.schemas.session import JobInput, SessionResponse
from api.services import session_service

router = APIRouter(
    prefix="/api/sessions", # API path
    tags=["sessions"] # Used to group the API calls related to sessions
)

@router.post("", response_model=SessionResponse, status_code=201)
def create_jd_session(payload: JobInput) -> SessionResponse:
    """
    This Function creates a session for the provided Job Description Input.

    Arguments:
        - payload: JobInput, Job Description from UI containing the title, position and details.
    Returns:
        - SessionResponse, session response with ID, requirements extracted and created time.
    """
    return session_service.create_session(payload)

@router.get("/{session_id}", response_model=SessionResponse)
def get_jd_session(session_id: str) -> SessionResponse:
    """
    This Function returns the Session details based on the provided session ID.

    Arguments:
        - session_id: str, Session ID used to fetch the session details.
    Returns:
        - SessionResponse, Session details of the requested Session ID.
    """
    session_details = session_service.get_session(session_id)
    if session_details is None:
        raise HTTPException(status_code=404, detail="Session Not Found")
    return session_details