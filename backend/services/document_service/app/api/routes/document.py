from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.api.routes.document_helper import get_owned_document_or_404
from app.models.document import Document
from app.models.research import Research
from app.models.template import Template
from app.models.file_document import FileDocument
from app.schemas.document import (
    CreateDocumentRequest,
    DocumentResponse,
    UpdateDocumentRequest,
)
from datetime import datetime
import os

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.get("/", response_model=list[DocumentResponse])
def get_my_documents(
    db: Session = Depends(get_db), current_user=Depends(get_current_user)
):
    documents = (
        db.query(Document).filter(Document.user_id == int(current_user["id"])).all()
    )

    return documents

@router.get("/my-documents-placeholder")
def placeholder():
    # Placeholder if any other routing relies on it, otherwise deleted.
    pass


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document_detail(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    document = get_owned_document_or_404(db, document_id, current_user)

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
                Document.penelitian_id == document.penelitian_id,
                Document.jenis_dokumen_id.in_([2, 3])
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




    
