from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.document import Document
from app.models.template import Template
from app.models.file_document import FileDocument
from app.schemas.document import (
    CreateDocumentRequest,
    DocumentResponse,
    UpdateDocumentRequest,
)
from app.schemas.document_related import RelatedDocumentsResponse
from app.schemas.document_package import ResearchPackageResponse
from datetime import datetime
import os

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/", response_model=DocumentResponse)
def create_document(
    payload: CreateDocumentRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if payload.jenis_dokumen_id == 1 and payload.parent_dokumen_id is not None:
        raise HTTPException(
            status_code=400,
            detail="Proposal tidak boleh memiliki dokumen induk",
        )

    if payload.jenis_dokumen_id in [2, 3] and payload.parent_dokumen_id is None:
        raise HTTPException(
            status_code=400,
            detail="Laporan kemajuan atau laporan akhir harus dibuat dari proposal",
        )

    if payload.parent_dokumen_id is not None:
        parent_document = (
            db.query(Document)
            .filter(
                Document.id == payload.parent_dokumen_id,
                Document.user_id == int(current_user["id"]),
            )
            .first()
        )

        if not parent_document:
            raise HTTPException(
                status_code=404,
                detail="Dokumen induk tidak ditemukan",
            )

        if parent_document.jenis_dokumen_id != 1:
            raise HTTPException(
                status_code=400,
                detail="Dokumen induk harus berupa proposal",
            )

    new_document = Document(
        user_id=int(current_user["id"]),
        jenis_dokumen_id=payload.jenis_dokumen_id,
        template_id=payload.template_id,
        parent_dokumen_id=payload.parent_dokumen_id,
        judul=payload.judul,
        status_dokumen="draft",
    )

    db.add(new_document)
    db.commit()
    db.refresh(new_document)

    return new_document

@router.get("/", response_model=list[DocumentResponse])
def get_my_documents(
    db: Session = Depends(get_db), current_user=Depends(get_current_user)
):
    documents = (
        db.query(Document).filter(Document.user_id == int(current_user["id"])).all()
    )

    return documents

@router.get("/{proposal_id}/related", response_model=RelatedDocumentsResponse)
def get_related_documents(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
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
        raise HTTPException(
            status_code=404,
            detail="Proposal tidak ditemukan",
        )

    laporan_kemajuan = (
        db.query(Document)
        .filter(
            Document.parent_dokumen_id == proposal_id,
            Document.user_id == int(current_user["id"]),
            Document.jenis_dokumen_id == 2,
        )
        .order_by(Document.created_at.desc())
        .first()
    )

    laporan_akhir = (
        db.query(Document)
        .filter(
            Document.parent_dokumen_id == proposal_id,
            Document.user_id == int(current_user["id"]),
            Document.jenis_dokumen_id == 3,
        )
        .order_by(Document.created_at.desc())
        .first()
    )

    return {
        "proposal": proposal,
        "laporan_kemajuan": laporan_kemajuan,
        "laporan_akhir": laporan_akhir,
    }

@router.post("/{proposal_id}/create-progress-report", response_model=DocumentResponse)
def create_progress_report_from_proposal(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
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
        raise HTTPException(
            status_code=404,
            detail="Proposal tidak ditemukan",
        )

    existing_report = (
        db.query(Document)
        .filter(
            Document.parent_dokumen_id == proposal_id,
            Document.user_id == int(current_user["id"]),
            Document.jenis_dokumen_id == 2,
        )
        .first()
    )

    if existing_report:
        raise HTTPException(
            status_code=400,
            detail="Laporan kemajuan untuk proposal ini sudah ada",
        )

    template = get_active_template_or_404(
        jenis_dokumen_id=2,
        db=db,
    )

    new_report = Document(
        user_id=int(current_user["id"]),
        jenis_dokumen_id=2,
        template_id=template.id,
        parent_dokumen_id=proposal.id,
        judul=f"Laporan Kemajuan - {proposal.judul}",
        status_dokumen="draft",
    )

    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    return new_report

@router.post("/{proposal_id}/create-final-report", response_model=DocumentResponse)
def create_final_report_from_proposal(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
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
        raise HTTPException(
            status_code=404,
            detail="Proposal tidak ditemukan",
        )

    existing_report = (
        db.query(Document)
        .filter(
            Document.parent_dokumen_id == proposal_id,
            Document.user_id == int(current_user["id"]),
            Document.jenis_dokumen_id == 3,
        )
        .first()
    )

    if existing_report:
        raise HTTPException(
            status_code=400,
            detail="Laporan akhir untuk proposal ini sudah ada",
        )

    template = get_active_template_or_404(
        jenis_dokumen_id=3,
        db=db,
    )

    new_report = Document(
        user_id=int(current_user["id"]),
        jenis_dokumen_id=3,
        template_id=template.id,
        parent_dokumen_id=proposal.id,
        judul=f"Laporan Akhir - {proposal.judul}",
        status_dokumen="draft",
    )

    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    return new_report

@router.get("/research-packages", response_model=list[ResearchPackageResponse])
def get_my_research_packages(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    proposals = (
        db.query(Document)
        .filter(
            Document.user_id == int(current_user["id"]),
            Document.jenis_dokumen_id == 1,
        )
        .order_by(Document.created_at.desc())
        .all()
    )

    result = []

    for proposal in proposals:
        laporan_kemajuan = (
            db.query(Document)
            .filter(
                Document.user_id == int(current_user["id"]),
                Document.parent_dokumen_id == proposal.id,
                Document.jenis_dokumen_id == 2,
            )
            .order_by(Document.created_at.desc())
            .first()
        )

        laporan_akhir = (
            db.query(Document)
            .filter(
                Document.user_id == int(current_user["id"]),
                Document.parent_dokumen_id == proposal.id,
                Document.jenis_dokumen_id == 3,
            )
            .order_by(Document.created_at.desc())
            .first()
        )

        result.append(
            {
                "proposal": proposal,
                "laporan_kemajuan": laporan_kemajuan,
                "laporan_akhir": laporan_akhir,
            }
        )

    return result

@router.get("/{document_id}", response_model=DocumentResponse)
def get_document_detail(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    document = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == int(current_user["id"]))
        .first()
    )

    if not document:
        raise HTTPException(status_code=404, detail="Dokumen tidak ditemukan")

    return document

@router.put("/{document_id}", response_model=DocumentResponse)
def update_document(
    document_id: int,
    payload: UpdateDocumentRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    document = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == int(current_user["id"]))
        .first()
    )

    if not document:
        raise HTTPException(status_code=404, detail="Dokumen tidak ditemukan")

    if payload.judul is not None:
        document.judul = payload.judul

    document.terakhir_autosave = datetime.now()

    db.commit()
    db.refresh(document)

    return document

@router.post("/{document_id}/autosave")
def autosave_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    document = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == int(current_user["id"]))
        .first()
    )

    if not document:
        raise HTTPException(status_code=404, detail="Dokumen tidak ditemukan")

    document.terakhir_autosave = datetime.now()
    db.commit()
    db.refresh(document)

    return {
        "message": "Autosave berhasil",
        "document_id": document.id,
        "terakhir_autosave": document.terakhir_autosave,
    }

@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
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

    if document.jenis_dokumen_id == 1:
        child_documents = (
            db.query(Document)
            .filter(
                Document.parent_dokumen_id == document.id,
                Document.user_id == int(current_user["id"]),
            )
            .all()
        )

        if child_documents:
            raise HTTPException(
                status_code=400,
                detail="Proposal tidak dapat dihapus karena sudah memiliki laporan kemajuan atau laporan akhir",
            )

    file_records = (
        db.query(FileDocument)
        .filter(FileDocument.dokumen_id == document.id)
        .all()
    )

    for file_record in file_records:
        if file_record.file_path and os.path.exists(file_record.file_path):
            os.remove(file_record.file_path)

        db.delete(file_record)

    db.delete(document)
    db.commit()

    return {
        "message": "Dokumen berhasil dihapus",
        "document_id": document_id,
    }

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




    
