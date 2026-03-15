from .models import AssessmentState
from .question_generator import generate_next_question
from .recommendation_engine import generate_recommendations


class AssessmentAgent:

    def __init__(self):
        self.max_questions = 10

    def next_step(self, state: AssessmentState, question_count: int):

        if question_count >= self.max_questions:
            return {
                "finished": True,
                "recommendations": generate_recommendations(state)
            }

        question = generate_next_question(state, question_count)

        return {
            "finished": False,
            "question": question
        }