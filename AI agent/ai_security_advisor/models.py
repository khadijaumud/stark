from pydantic import BaseModel
from typing import List, Optional


class Answer(BaseModel):
    question: str
    answer: str


class AssessmentState(BaseModel):
    company_size: Optional[str] = None
    infrastructure: Optional[str] = None
    cloud_provider: Optional[str] = None
    has_security_team: Optional[bool] = None
    answers: List[Answer] = []


class Question(BaseModel):
    question: str
    options: List[str]


class Recommendation(BaseModel):
    title: str
    description: str