from pydantic import BaseModel, field_validator
from typing import Literal, Optional
from datetime import datetime

class Evidence(BaseModel):
    id: str
    title: str
    source: Literal["about_me", "education", "work_experience", "projects", "skills", "general"]
    file: str
    section: str
    text: str
    context: Optional[str]
    relevance: int
    why: str
    requirements: list[str]
    status: Literal["confirmed_by_user","user_reported_estimate", "needs_confirmation"]

    @field_validator("relevance")
    @classmethod
    def validate_relevance(cls, relevance: int):
        if relevance < 0 or relevance > 100:
            raise ValueError(f"Relevance accepted range 0 to 100, actual value {relevance}")
        return relevance

class MissingEvidence(BaseModel):
    requirement: str
    message: str

class EvidenceResponse(BaseModel):
    id: str
    evidence: list[Evidence]
    missing_evidence: list[MissingEvidence]
    created_at: datetime