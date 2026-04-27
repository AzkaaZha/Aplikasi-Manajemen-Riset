from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.template import Template


def get_owned_document_or_404(
    document_id: int,
    db: Session,
    current_user,
):
    document = (
        db.query(Document)
        .filter(
            Document.id == document_id,
            Document.user_id == int(current_user["id"]),
        )
        .first()
    )

    if not document:
        raise HTTPException(status_code=404, detail="Dokumen tidak ditemukan")

    return document


def get_proposal_or_404(
    proposal_id: int,
    db: Session,
    current_user,
):
    proposal = (
        db.query(Document)
        .filter(
            Document.id == proposal_id,
            Document.user_id == int(current_user["id"]),
            Document.jenis_dokumen_id == 1,
        )
        .first()
    )

    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal tidak ditemukan")

    return proposal


def get_active_template_or_404(
    jenis_dokumen_id: int,
    db: Session,
):
    template = (
        db.query(Template)
        .filter(
            Template.jenis_dokumen_id == jenis_dokumen_id,
            Template.status_aktif == 1,
        )
        .order_by(Template.id.desc())
        .first()
    )

    if not template:
        raise HTTPException(
            status_code=404,
            detail="Template aktif tidak ditemukan",
        )

    return template