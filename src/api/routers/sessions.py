from fastapi import APIRouter, HTTPException
from api.schemas.session import JobInput, SessionResponse
from api.services import session_service

router = APIRouter(
    prefix="/api/sessions",
    tags=["sessions"]
)

@router.post("", response_model=SessionResponse, status_code=201)
def create_jd_session(payload: JobInput) -> SessionResponse:
    return session_service.create_session(payload)

@router.get("/{session_id}", response_model=SessionResponse)
def get_jd_session(session_id: str) -> SessionResponse:
    session_details = session_service.get_session(session_id)
    if session_details is None:
        raise HTTPException(status_code=404, detail="Session Not Found")
    return session_details