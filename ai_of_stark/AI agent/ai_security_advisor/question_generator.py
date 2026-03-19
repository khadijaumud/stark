from .prompts import QUESTION_GENERATION_PROMPT
from .llm_client import ask_llm


def generate_question(history):
    """
    Generates the next AI question based on conversation history.
    """

    if not history:
        history_text = "No previous questions."
    else:
        history_text = "\n".join(
            [f"Q: {h['question']} | A: {h['answer']}" for h in history]
        )

    prompt = QUESTION_GENERATION_PROMPT.format(
        history=history_text
    )

    response = ask_llm(prompt)

    return response