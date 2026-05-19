from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.research import Research


def get_owned_document_or_404(
    db: Session,
    document_id: int,
    current_user
):
    document = (
        db.query(Document)
        .join(Research, Document.penelitian_id == Research.id)
        .filter(
            Document.id == document_id,
            Research.user_id == current_user["id"]
        )
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Dokumen tidak ditemukan"
        )

    return document