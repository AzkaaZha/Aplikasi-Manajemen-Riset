from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.template import Template
from app.models.research import Research


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


def recalculate_research_status(db: Session, research_id: int):
    """
    Menghitung ulang status penelitian berdasarkan kelengkapan dokumen:
    - Lengkap (selesai): Jika Proposal, Lap. Kemajuan, dan Lap. Akhir semuanya ada.
    - Draft (draft): Jika ada salah satu dokumen yang belum dibuat.
    """
    research = db.query(Research).filter(Research.id == research_id).first()
    if not research:
        return

    # Hitung jumlah jenis dokumen unik yang sudah dibuat
    # 1: Proposal, 2: Laporan Kemajuan, 3: Laporan Akhir
    doc_types = db.query(Document.jenis_dokumen_id).filter(
        Document.penelitian_id == research_id
    ).distinct().all()
    
    unique_types = [t[0] for t in doc_types]
    
    # Syarat Lengkap: Harus punya jenis 1, 2, dan 3
    if 1 in unique_types and 2 in unique_types and 3 in unique_types:
        research.status_penelitian = "selesai"
    else:
        research.status_penelitian = "draft"
    
    db.commit()