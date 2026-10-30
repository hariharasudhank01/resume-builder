"""
This Script defines the Schema for the Session and Job Description Input
"""
from pydantic import BaseModel, Field, field_validator
from typing import Literal
from datetime import datetime

class JobInput(BaseModel):
    """
    This Function defines the schema for the Job description input. The first interaction
    between the user and the application. Collects the company title, position and JD from
    the user. 
    """
    title: str = Field(default="")
    company: str = Field(default="")
    description: str

    @field_validator("description")
    @classmethod
    def validate_description(cls, description):
        words = description.split()
        if not len(words) >= 40 or not len(words) <= 2000:
            raise ValueError("Description length should be between 40 and 2000 words")
        return description

class RequirementGroup(BaseModel):
    """
    This Function defines the schema for the requirements displayed back in the front end
    extracted by the LLM.
    """
    key: Literal["required", "preferred", "responsibilities"]
    label: str
    items: list[str]

class SessionResponse(BaseModel):
    """
    This Function defines the schema for the overall session response from the backend.
    """
    id: str
    job: JobInput
    requirements: list[RequirementGroup]
    created_at: datetime