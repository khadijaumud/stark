from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, String, create_engine, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship, sessionmaker
from starlette.middleware.sessions import SessionMiddleware

from api.ai_assessment import router as ai_assessment_router


DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")
SESSION_SECRET_KEY = os.getenv("SESSION_SECRET_KEY", "dev-change-me")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    __table_args__ = (
        CheckConstraint("role IN ('company','hacker')", name="ck_users_role"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)

    company_profile: Mapped[Optional[CompanyProfile]] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    hacker_profile: Mapped[Optional[HackerProfile]] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )


class CompanyProfile(Base):
    __tablename__ = "company_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    company_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    industry: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    user: Mapped[User] = relationship(back_populates="company_profile")


class HackerProfile(Base):
    __tablename__ = "hacker_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    experience_level: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    skills: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    github_link: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    user: Mapped[User] = relationship(back_populates="hacker_profile")


class JobPost(Base):
    __tablename__ = "job_posts"

    __table_args__ = (
        CheckConstraint("status IN ('open','closed')", name="ck_job_posts_status"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(String(5000), nullable=False)
    start_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="open")

    company: Mapped[User] = relationship("User")


engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def create_db_and_tables() -> None:
    Base.metadata.create_all(bind=engine)


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def get_current_user(request: Request, db: Session) -> User:
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = db.get(User, user_id)
    if not user:
        request.session.clear()
        raise HTTPException(status_code=401, detail="Not authenticated")

    return user


class RegisterReq(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    role: str = Field(pattern=r"^(company|hacker)$")

    company_name: Optional[str] = None
    industry: Optional[str] = None

    experience_level: Optional[str] = None
    skills: Optional[List[str]] = None
    github_link: Optional[str] = None


class RegisterResp(BaseModel):
    message: str
    role: str


class LoginReq(BaseModel):
    email: EmailStr
    password: str


class LoginResp(BaseModel):
    message: str
    role: str


class JobPostOut(BaseModel):
    id: int
    company_id: int
    title: str
    description: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: str


class CreateJobReq(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=10, max_length=5000)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class HackerDashboardResp(BaseModel):
    username: str
    email: EmailStr
    profile: dict
    score: int
    rank: int
    completed_tasks: int
    open_jobs: List[JobPostOut]


class CompanyDashboardResp(BaseModel):
    username: str
    email: EmailStr
    profile: dict
    jobs: List[JobPostOut]


app = FastAPI()

app.include_router(ai_assessment_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    SessionMiddleware,
    secret_key=SESSION_SECRET_KEY,
    same_site="lax",
    https_only=False,
)


@app.on_event("startup")
def on_startup() -> None:
    create_db_and_tables()


@app.post("/api/register", response_model=RegisterResp)
def register(payload: RegisterReq, db: Session = Depends(get_db)) -> RegisterResp:
    user = User(
        username=payload.username,
        email=str(payload.email).lower(),
        password_hash=hash_password(payload.password),
        role=payload.role,
    )

    try:
        with db.begin():
            db.add(user)
            db.flush()

            if payload.role == "company":
                profile = CompanyProfile(
                    user_id=user.id,
                    company_name=payload.company_name,
                    industry=payload.industry,
                )
                db.add(profile)
            else:
                skills_str = ",".join(payload.skills) if payload.skills else None
                profile = HackerProfile(
                    user_id=user.id,
                    experience_level=payload.experience_level,
                    skills=skills_str,
                    github_link=payload.github_link,
                )
                db.add(profile)

    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Username or email already exists")

    return RegisterResp(message="Registered successfully", role=user.role)


@app.post("/api/login", response_model=LoginResp)
def login(payload: LoginReq, request: Request, db: Session = Depends(get_db)) -> LoginResp:
    stmt = select(User).where(User.email == str(payload.email).lower())
    user = db.execute(stmt).scalar_one_or_none()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    request.session["user_id"] = user.id
    request.session["role"] = user.role

    return LoginResp(message="Login successful", role=user.role)


@app.get("/api/hacker/dashboard", response_model=HackerDashboardResp)
def hacker_dashboard(request: Request, db: Session = Depends(get_db)) -> HackerDashboardResp:
    user = get_current_user(request, db)
    if user.role != "hacker":
        raise HTTPException(status_code=403, detail="Forbidden")

    stmt = select(JobPost).where(JobPost.status == "open").order_by(JobPost.id.desc())
    jobs = db.execute(stmt).scalars().all()

    profile = user.hacker_profile
    profile_dict = {
        "experience_level": profile.experience_level if profile else "",
        "skills": (profile.skills or "") if profile else "",
        "github_link": profile.github_link if profile else "",
    }

    return HackerDashboardResp(
        username=user.username,
        email=user.email,
        profile=profile_dict,
        score=0,
        rank=0,
        completed_tasks=0,
        open_jobs=[
            JobPostOut(
                id=j.id,
                company_id=j.company_id,
                title=j.title,
                description=j.description,
                start_date=j.start_date,
                end_date=j.end_date,
                status=j.status,
            )
            for j in jobs
        ],
    )


@app.get("/api/company/dashboard", response_model=CompanyDashboardResp)
def company_dashboard(request: Request, db: Session = Depends(get_db)) -> CompanyDashboardResp:
    user = get_current_user(request, db)
    if user.role != "company":
        raise HTTPException(status_code=403, detail="Forbidden")

    stmt = select(JobPost).where(JobPost.company_id == user.id).order_by(JobPost.id.desc())
    jobs = db.execute(stmt).scalars().all()

    profile = user.company_profile
    profile_dict = {
        "company_name": profile.company_name if profile else "",
        "industry": profile.industry if profile else "",
    }

    return CompanyDashboardResp(
        username=user.username,
        email=user.email,
        profile=profile_dict,
        jobs=[
            JobPostOut(
                id=j.id,
                company_id=j.company_id,
                title=j.title,
                description=j.description,
                start_date=j.start_date,
                end_date=j.end_date,
                status=j.status,
            )
            for j in jobs
        ],
    )


@app.get("/api/bounties/all", response_model=List[JobPostOut])
def all_active_bounties(request: Request, db: Session = Depends(get_db)) -> List[JobPostOut]:
    user = get_current_user(request, db)
    if user.role != "hacker":
        raise HTTPException(status_code=403, detail="Forbidden")

    now = datetime.now(timezone.utc)
    stmt = select(JobPost).where(JobPost.status == "open").order_by(JobPost.id.desc())
    jobs = db.execute(stmt).scalars().all()

    active: List[JobPostOut] = []
    for j in jobs:
        if j.start_date and j.start_date > now:
            continue
        if j.end_date and j.end_date < now:
            continue
        active.append(
            JobPostOut(
                id=j.id,
                company_id=j.company_id,
                title=j.title,
                description=j.description,
                start_date=j.start_date,
                end_date=j.end_date,
                status=j.status,
            )
        )

    return active


@app.post("/api/jobs", response_model=JobPostOut)
def create_job(payload: CreateJobReq, request: Request, db: Session = Depends(get_db)) -> JobPostOut:
    user = get_current_user(request, db)
    if user.role != "company":
        raise HTTPException(status_code=403, detail="Forbidden")

    job = JobPost(
        company_id=user.id,
        title=payload.title,
        description=payload.description,
        start_date=payload.start_date,
        end_date=payload.end_date,
        status="open",
    )

    with db.begin():
        db.add(job)
        db.flush()

    return JobPostOut(
        id=job.id,
        company_id=job.company_id,
        title=job.title,
        description=job.description,
        start_date=job.start_date,
        end_date=job.end_date,
        status=job.status,
    )
