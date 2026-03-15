from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import select

import main as main_module
from main import CompanyProfile, JobPost, SessionLocal, User, create_db_and_tables, hash_password


def _get_or_create_demo_company(db) -> User:
    company = db.execute(select(User).where(User.role == "company").order_by(User.id.asc())).scalars().first()
    if company:
        return company

    company = User(
        username="demo_company",
        email="demo_company@example.com",
        password_hash=hash_password("demo-change-me"),
        role="company",
    )
    db.add(company)
    db.flush()

    profile = CompanyProfile(user_id=company.id, company_name="Demo Company", industry="Cybersecurity")
    db.add(profile)
    db.flush()

    return company


EXAMPLES = [
    {
        "title": "External Web Portal Security Audit",
        "description": "Gray-box security audit focusing on OWASP Top 10 vulnerabilities like SQLi and XSS.",
        "start_date": datetime(2024, 3, 20, tzinfo=timezone.utc),
        "end_date": datetime(2024, 4, 20, tzinfo=timezone.utc),
    },
    {
        "title": "Mobile App Backend API Security",
        "description": "Testing REST API endpoints for Authorization bypass (IDOR) and sensitive data exposure.",
        "start_date": datetime(2024, 3, 25, tzinfo=timezone.utc),
        "end_date": datetime(2024, 5, 10, tzinfo=timezone.utc),
    },
]


def seed() -> None:
    create_db_and_tables()

    with SessionLocal() as db:
        with db.begin():
            company = _get_or_create_demo_company(db)

            existing_titles = set(
                db.execute(select(JobPost.title).where(JobPost.company_id == company.id)).scalars().all()
            )

            inserted = 0
            for ex in EXAMPLES:
                if ex["title"] in existing_titles:
                    print(f"  ↳ skipped (exists): {ex['title']}")
                    continue

                db.add(
                    JobPost(
                        company_id=company.id,
                        title=ex["title"],
                        description=ex["description"],
                        start_date=ex["start_date"],
                        end_date=ex["end_date"],
                        status="open",
                    )
                )
                inserted += 1
                print(f"  ✓ inserted: {ex['title']}")

    print(f"\nDone — {inserted} bounty(ies) seeded.")


if __name__ == "__main__":
    seed()
