from fastapi import APIRouter
from ai_security_advisor.assessment_agent import AssessmentAgent
from ai_security_advisor.models import AssessmentState

router = APIRouter()
agent = AssessmentAgent()


@router.post("/ai-assessment/next")
def next_question(state: AssessmentState, question_count: int):

    result = agent.next_step(state, question_count)

    return result