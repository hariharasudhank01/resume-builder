"""
This Script handles the API Router logic for Evidence UI page.
"""
from fastapi import APIRouter, HTTPException, Query
from api.schemas.evidence import EvidenceResponse
from api.services import evidence_service, session_service

router = APIRouter(
    prefix="/api/sessions",
    tags=["evidence"]
)

@router.get("/{session_id}/evidence", response_model=EvidenceResponse)
def get_session_evidence(session_id: str, limit: int = Query(default=20, ge=1, le=50)) -> EvidenceResponse:
    """
    This Function gets the evidence for the Job Requirement present in the provided session ID.

    Arguments:
        - session_id: str, session ID for which evidence needs to be gathered.
        - limit: int, query parameter in the API. default is 20 if user doesn't provide it. (?limit=20)
    Returns:
        - EvidenceResponse, evidence details
    """
    session = session_service.get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return evidence_service.get_evidence(session, limit)