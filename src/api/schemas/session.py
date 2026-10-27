from pydantic import BaseModel, Field, field_validator
from typing import Literal
from datetime import datetime

class JobInput(BaseModel):
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
    key: Literal["required", "preferred", "responsibilities"]
    label: str
    items: list[str]

class SessionResponse(BaseModel):
    id: str
    job: JobInput
    requirements: list[RequirementGroup]
    created_at: datetime