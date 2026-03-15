QUESTION_GENERATION_PROMPT = """
You are a cybersecurity consultant interviewing a company.

Conversation history:
{history}

Generate ONE clear question that helps determine the company's security posture.

Return JSON format:

{{
 "question": "...",
 "options": ["...", "...", "..."]
}}

Do not include any text outside the JSON.
"""

RECOMMENDATION_PROMPT = """
You are a cybersecurity advisor.

Based on the company answers below, evaluate the company's cybersecurity posture.

Answers:
{answers}

You must:

1. Estimate a cybersecurity risk score from 0–100
   (0 = extremely insecure, 100 = very mature security).

2. Determine a security maturity level:
   - Low
   - Moderate
   - High
   - Advanced

3. Recommend cybersecurity services.

Return ONLY JSON:

{{
 "security_score": number,
 "security_level": "...",
 "recommendations": [
   {{
     "title": "...",
     "description": "..."
   }}
 ]
}}
"""