from .prompts import RECOMMENDATION_PROMPT
from .llm_client import ask_llm


def generate_recommendations(answers):

    answers_text = "\n".join(
        [f"Q: {a['question']} | A: {a['answer']}" for a in answers]
    )

    prompt = RECOMMENDATION_PROMPT.format(
        answers=answers_text
    )

    response = ask_llm(prompt)

    return response