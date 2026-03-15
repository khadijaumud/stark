import json
import re
import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

API_KEY = os.getenv("GROQ_API_KEY")


def _get_client() -> Groq:
    if not API_KEY:
        raise RuntimeError("GROQ_API_KEY is not set. Set it in your environment or .env file.")
    return Groq(api_key=API_KEY)


def ask_llm(prompt: str):

    client = _get_client()

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.3
    )

    content = response.choices[0].message.content

    try:
        return json.loads(content)

    except:
        # try extracting JSON block
        match = re.search(r"\{[\s\S]*\}", content)

        if match:
            try:
                return json.loads(match.group())
            except:
                pass

        return {"error": "Invalid JSON", "raw": content}