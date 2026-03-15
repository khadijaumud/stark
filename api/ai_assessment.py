from __future__ import annotations

import importlib.util
import json
import os
from pathlib import Path
import sys
import types
import uuid
from typing import Any, Dict, List, Optional

from importlib import import_module

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app_core import User, get_current_user, get_db


router = APIRouter(prefix="/api/ai", tags=["ai-assessment"])

TOTAL_QUESTIONS = 5


history_store: Dict[str, Dict[str, Any]] = {}


_FALLBACK_QUESTIONS: List[Dict[str, Any]] = [
    {
        "question": "Do you enforce multi-factor authentication (MFA) for admin and production access?",
        "options": ["Yes (everywhere)", "Partially", "No"],
    },
    {
        "question": "How do you manage and rotate secrets (API keys, DB creds) in production?",
        "options": ["Dedicated secret manager + rotation", "Env vars/manual rotation", "Hardcoded / inconsistent"],
    },
    {
        "question": "Do you have logging/monitoring with alerting for suspicious activity?",
        "options": ["Centralized logging + alerts", "Basic logs, limited alerts", "No"],
    },
    {
        "question": "How often do you patch OS/dependencies and remediate known vulnerabilities?",
        "options": ["Within days", "Monthly/quarterly", "Rarely"],
    },
    {
        "question": "Do you run regular security testing (SAST/DAST, pentests, bug bounty)?",
        "options": ["Yes (continuous + periodic)", "Occasionally", "No"],
    },
]


def _fallback_generate_question(history: List[Dict[str, str]]):
    idx = min(len(history), len(_FALLBACK_QUESTIONS) - 1)
    return _FALLBACK_QUESTIONS[idx]


def _fallback_generate_recommendations(history: List[Dict[str, str]]):
    answers = [str(h.get("answer", "")).lower() for h in history]
    negative = sum(1 for a in answers if any(k in a for k in ["no", "rare", "hardcoded", "inconsistent"]))
    partial = sum(1 for a in answers if any(k in a for k in ["partial", "basic", "occasion"]))

    score = max(10, 85 - negative * 18 - partial * 10)
    if score >= 80:
        risk = "Advanced"
    elif score >= 65:
        risk = "High"
    elif score >= 45:
        risk = "Moderate"
    else:
        risk = "Low"

    actions = [
        "Enable MFA for all privileged accounts and production access",
        "Centralize secrets in a secret manager and rotate on a schedule",
        "Implement centralized logging, alerting, and incident response runbooks",
        "Automate dependency scanning and patch SLAs",
        "Launch a pentest and/or invite vetted hackers for continuous testing",
    ]

    return {
        "security_score": int(max(0, min(100, score))),
        "risk_level": risk,
        "recommended_actions": actions,
    }


def _load_ai_module(module_name: str, file_path: Path):
    spec = importlib.util.spec_from_file_location(module_name, str(file_path))
    if not spec or not spec.loader:
        raise RuntimeError(f"Could not load module: {module_name}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _load_ai_security_advisor_package(base: Path) -> types.ModuleType:
    pkg_name = "_stark_ai_security_advisor"

    existing = sys.modules.get(pkg_name)
    if existing:
        return existing

    if not base.exists():
        raise HTTPException(status_code=500, detail="AI Security Advisor folder not found")

    pkg = types.ModuleType(pkg_name)
    pkg.__path__ = [str(base)]
    sys.modules[pkg_name] = pkg

    def load_submodule(filename: str) -> types.ModuleType:
        file_path = base / filename
        if not file_path.exists():
            raise HTTPException(status_code=500, detail=f"Missing AI module: {filename}")

        mod_name = f"{pkg_name}.{file_path.stem}"
        if mod_name in sys.modules:
            return sys.modules[mod_name]

        spec = importlib.util.spec_from_file_location(mod_name, str(file_path))
        if not spec or not spec.loader:
            raise HTTPException(status_code=500, detail=f"Could not load AI module: {filename}")

        mod = importlib.util.module_from_spec(spec)
        mod.__package__ = pkg_name
        sys.modules[mod_name] = mod
        spec.loader.exec_module(mod)
        return mod

    load_submodule("prompts.py")
    load_submodule("llm_client.py")
    load_submodule("models.py")
    load_submodule("question_generator.py")
    load_submodule("recommendation_engine.py")

    return pkg


def _get_ai_functions() -> tuple[Any, Any]:
    root = Path(__file__).resolve().parents[1]
    agent_root = root / "ai_of_stark" / "AI agent"
    base = agent_root / "ai_security_advisor"

    try:
        if not os.getenv("GROQ_API_KEY"):
            return _fallback_generate_question, _fallback_generate_recommendations

        if str(agent_root) not in sys.path:
            sys.path.insert(0, str(agent_root))

        q_mod = import_module("ai_security_advisor.question_generator")
        r_mod = import_module("ai_security_advisor.recommendation_engine")

        if not hasattr(q_mod, "generate_question"):
            raise HTTPException(status_code=500, detail="AI question generator is missing generate_question")
        if not hasattr(r_mod, "generate_recommendations"):
            raise HTTPException(status_code=500, detail="AI recommendation engine is missing generate_recommendations")

        return q_mod.generate_question, r_mod.generate_recommendations
    except ModuleNotFoundError as e:
        if getattr(e, "name", "") == "groq":
            return _fallback_generate_question, _fallback_generate_recommendations
        raise
    except HTTPException:
        raise
    except Exception:
        _load_ai_security_advisor_package(base)

        q_mod = sys.modules.get("_stark_ai_security_advisor.question_generator")
        r_mod = sys.modules.get("_stark_ai_security_advisor.recommendation_engine")

        if not q_mod or not hasattr(q_mod, "generate_question"):
            raise HTTPException(status_code=500, detail="AI question generator is missing generate_question")
        if not r_mod or not hasattr(r_mod, "generate_recommendations"):
            raise HTTPException(status_code=500, detail="AI recommendation engine is missing generate_recommendations")

        return q_mod.generate_question, r_mod.generate_recommendations


def _parse_recommendations(raw: Any) -> Dict[str, Any]:
    if isinstance(raw, dict):
        score = int(raw.get("security_score", raw.get("score", 70)) or 70)
        risk = str(
            raw.get("risk_level", raw.get("security_level", raw.get("risk", "Moderate"))) or "Moderate"
        )

        actions = raw.get("recommended_actions") or raw.get("actions")
        if actions is None and isinstance(raw.get("recommendations"), list):
            actions = [
                str(r.get("title") or "").strip() or str(r.get("description") or "").strip()
                for r in raw.get("recommendations")
                if isinstance(r, dict)
            ]
        actions = actions or []
        if isinstance(actions, str):
            actions = [a.strip("- •\t ") for a in actions.splitlines() if a.strip()]
        if not isinstance(actions, list):
            actions = []
        return {"security_score": max(0, min(100, score)), "risk_level": risk, "recommended_actions": actions[:8]}

    if isinstance(raw, str):
        text = raw.strip()
        try:
            parsed = json.loads(text)
            if isinstance(parsed, dict):
                return _parse_recommendations(parsed)
        except Exception:
            pass

        actions = [a.strip("- •\t ") for a in text.splitlines() if a.strip()]
        return {"security_score": 70, "risk_level": "Moderate", "recommended_actions": actions[:8]}

    return {"security_score": 70, "risk_level": "Moderate", "recommended_actions": []}


class AIQuestion(BaseModel):
    question: str
    options: List[str]


class AIStartResp(BaseModel):
    session_id: str
    step: int
    total_steps: int
    question: AIQuestion


class AINextReq(BaseModel):
    session_id: str
    answer: str = Field(min_length=1, max_length=2000)


class AIFinalResp(BaseModel):
    session_id: str
    total_steps: int
    security_score: int
    risk_level: str
    recommended_actions: List[str]


class AINextResp(BaseModel):
    session_id: str
    finished: bool
    step: int
    total_steps: int
    question: Optional[AIQuestion] = None
    result: Optional[AIFinalResp] = None


def _require_company(request: Request, db: Session) -> User:
    user = get_current_user(request, db)
    if user.role != "company":
        raise HTTPException(status_code=403, detail="Forbidden")
    return user


@router.post("/start", response_model=AIStartResp)
def start_ai_assessment(request: Request, db: Session = Depends(get_db)) -> AIStartResp:
    user = _require_company(request, db)
    generate_question, _ = _get_ai_functions()

    session_id = f"ai-{user.id}-{uuid.uuid4().hex}"  # in-memory session
    history: List[Dict[str, str]] = []

    try:
        q_obj = generate_question(history)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI question generation failed: {e}")

    if not isinstance(q_obj, dict) or "question" not in q_obj or "options" not in q_obj:
        raise HTTPException(status_code=500, detail="AI question generator returned invalid format")
    if not isinstance(q_obj.get("options"), list):
        raise HTTPException(status_code=500, detail="AI question generator returned invalid options")

    history_store[session_id] = {
        "user_id": user.id,
        "step": 1,
        "history": history,
        "current_question": {"question": str(q_obj.get("question", "")), "options": list(q_obj.get("options", []))},
    }

    return AIStartResp(
        session_id=session_id,
        step=1,
        total_steps=TOTAL_QUESTIONS,
        question=AIQuestion(
            question=str(q_obj.get("question", "")),
            options=[str(o) for o in (q_obj.get("options") or [])],
        ),
    )


@router.post("/next", response_model=AINextResp)
def next_ai_assessment(payload: AINextReq, request: Request, db: Session = Depends(get_db)) -> AINextResp:
    user = _require_company(request, db)
    generate_question, generate_recommendations = _get_ai_functions()

    sess = history_store.get(payload.session_id)
    if not sess:
        raise HTTPException(status_code=400, detail="Invalid session_id")
    if sess.get("user_id") != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    step = int(sess.get("step", 1))
    history = sess.get("history")
    if not isinstance(history, list):
        history = []

    current_question = sess.get("current_question")
    if isinstance(current_question, dict):
        q_text = str(current_question.get("question", ""))
    else:
        q_text = str(current_question or "")
    history.append({"question": q_text, "answer": payload.answer})

    if step >= TOTAL_QUESTIONS:
        try:
            raw = generate_recommendations(history)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"AI recommendations failed: {e}")
        parsed = _parse_recommendations(raw)
        final = AIFinalResp(
            session_id=payload.session_id,
            total_steps=TOTAL_QUESTIONS,
            security_score=int(parsed["security_score"]),
            risk_level=str(parsed["risk_level"]),
            recommended_actions=list(parsed["recommended_actions"]),
        )
        history_store.pop(payload.session_id, None)
        return AINextResp(
            session_id=payload.session_id,
            finished=True,
            step=TOTAL_QUESTIONS,
            total_steps=TOTAL_QUESTIONS,
            question=None,
            result=final,
        )

    try:
        next_q_obj = generate_question(history)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI question generation failed: {e}")

    if not isinstance(next_q_obj, dict) or "question" not in next_q_obj or "options" not in next_q_obj:
        raise HTTPException(status_code=500, detail="AI question generator returned invalid format")
    if not isinstance(next_q_obj.get("options"), list):
        raise HTTPException(status_code=500, detail="AI question generator returned invalid options")

    step += 1
    sess["step"] = step
    sess["history"] = history
    sess["current_question"] = {
        "question": str(next_q_obj.get("question", "")),
        "options": list(next_q_obj.get("options", [])),
    }
    history_store[payload.session_id] = sess

    return AINextResp(
        session_id=payload.session_id,
        finished=False,
        step=step,
        total_steps=TOTAL_QUESTIONS,
        question=AIQuestion(
            question=str(next_q_obj.get("question", "")),
            options=[str(o) for o in (next_q_obj.get("options") or [])],
        ),
        result=None,
    )
