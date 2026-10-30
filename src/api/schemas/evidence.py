"""
This Script define the Schema for the second page in the UI. The Evidence page.
"""
from pydantic import BaseModel, Field
from typing import Literal

class Evidence(BaseModel):
    """
    This function defines the Schema for the Evidence displayed in the
    UI based on the knowledge base.
    """
    id: str
    title: str
    source: Literal["about_me", "education", "work_experience", "projects", "skills", "general"]
    file: str
    section: str
    text: str
    context: str | None = None
    relevance: int = Field(ge=0, le=100)
    why: str
    requirements: list[str]
    status: Literal["confirmed_by_user","user_reported_estimate", "needs_confirmation"]

class MissingEvidence(BaseModel):
    """
    This Function defines the Schema for the case when there is no Evidence supporting
    the Job requirements
    """
    requirement: str
    message: str

class EvidenceResponse(BaseModel):
    """
    This Function defines the Schema for the overall evidence response from the backend
    """
    session_id: str
    evidence: list[Evidence]
    missing_evidence: list[MissingEvidence]