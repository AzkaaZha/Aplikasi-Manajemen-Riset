from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.research import Research


def get_owned_research_or_404(
    db: Session,
    research_id: int,
    current_user
):
    research = (
        db.query(Research)
        .filter(
            Research.id == research_id,
            Research.user_id == current_user["id"]
        )
        .first()
    )

    if not research:
        raise HTTPException(status_code=404, detail="Penelitian tidak ditemukan")

    return research