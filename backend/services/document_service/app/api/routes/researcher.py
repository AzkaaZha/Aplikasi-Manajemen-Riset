from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.document import Document
from app.models.researcher import Researcher
from app.schemas.researcher import (
    CreateResearcherRequest,
    UpdateResearcherRequest,
    ResearcherResponse
)

router = APIRouter(prefix="/documents/{document_id}/researchers", tags=["Researchers"])


def get_user_document(document_id: int, db: Session, current_user):
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == int(current_user["id"])
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Dokumen tidak ditemukan")

    return document


@router.post("/", response_model=ResearcherResponse)
def create_researcher(
    document_id: int,
    payload: CreateResearcherRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    get_user_document(document_id, db, current_user)

    researcher = Researcher(
        dokumen_id=document_id,
        nama=payload.nama,
        peran=payload.peran,
        institusi=payload.institusi,
        program_studi=payload.program_studi,
        bidang_tugas=payload.bidang_tugas,
        id_sinta=payload.id_sinta,
        h_index=payload.h_index,
        nidn_nip_nim=payload.nidn_nip_nim
    )

    db.add(researcher)
    db.commit()
    db.refresh(researcher)

    return researcher


@router.get("/", response_model=list[ResearcherResponse])
def get_researchers(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    get_user_document(document_id, db, current_user)

    return db.query(Researcher).filter(
        Researcher.dokumen_id == document_id
    ).all()


@router.put("/{researcher_id}", response_model=ResearcherResponse)
def update_researcher(
    document_id: int,
    researcher_id: int,
    payload: UpdateResearcherRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    get_user_document(document_id, db, current_user)

    researcher = db.query(Researcher).filter(
        Researcher.id == researcher_id,
        Researcher.dokumen_id == document_id
    ).first()

    if not researcher:
        raise HTTPException(status_code=404, detail="Pengusul tidak ditemukan")

    data = payload.model_dump(exclude_unset=True)

    for key, value in data.items():
        setattr(researcher, key, value)

    db.commit()
    db.refresh(researcher)

    return researcher


@router.delete("/{researcher_id}")
def delete_researcher(
    document_id: int,
    researcher_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    get_user_document(document_id, db, current_user)

    researcher = db.query(Researcher).filter(
        Researcher.id == researcher_id,
        Researcher.dokumen_id == document_id
    ).first()

    if not researcher:
        raise HTTPException(status_code=404, detail="Pengusul tidak ditemukan")

    db.delete(researcher)
    db.commit()

    return {
        "message": "Pengusul berhasil dihapus",
        "researcher_id": researcher_id
    }