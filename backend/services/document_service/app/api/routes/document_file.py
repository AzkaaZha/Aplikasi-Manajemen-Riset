from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.dependencies.auth import get_current_user
from fastapi.responses import FileResponse
from app.api.routes.document_helper import get_owned_document_or_404
from app.schemas.file_document import FileDocumentResponse
from app.models.document import Document
from app.models.file_document import FileDocument
import os
import shutil
from pathlib import Path
from datetime import datetime

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/{document_id}/files", response_model=FileDocumentResponse)
def upload_document_file(
    document_id: int,
    file: UploadFile = File(...),
    nama_lampiran: str = Form(...),
    tipe_lampiran: str = Form(...),
    keterangan: str = Form(None),
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


    storage_dir = Path(__file__).resolve().parents[3] / "storage" / "uploads"
    storage_dir.mkdir(parents=True, exist_ok=True)


    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_ext = Path(file.filename).suffix

    safe_name = "".join(c for c in nama_lampiran if c.isalnum() or c in (' ', '.', '_')).rstrip()
    safe_name = safe_name.replace(' ', '_')
    unique_filename = f"{safe_name}_{timestamp}{file_ext}"
    file_path = storage_dir / unique_filename


    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal menyimpan file: {str(e)}")


    new_file = FileDocument(
        dokumen_id=document_id,
        nama_file=nama_lampiran,
        file_path=str(file_path),
        tipe_file=tipe_lampiran.lower(),
    )

    db.add(new_file)
    db.commit()
    db.refresh(new_file)

    return new_file

@router.get("/{document_id}/files", response_model=list[FileDocumentResponse])
def get_document_files(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    document = get_owned_document_or_404(db, document_id, current_user)

    document = (
        db.query(Document)
        .filter(
            Document.id == document_id,
            Document.user_id == int(current_user["id"])
        )
        .first()
    )

    if not document:
        raise HTTPException(status_code=404, detail="Dokumen tidak ditemukan")

    files = (
        db.query(FileDocument)
        .filter(FileDocument.dokumen_id == document_id)
        .order_by(FileDocument.created_at.desc())
        .all()
    )

    return files

@router.get("/{document_id}/files/{file_id}/download")
def download_document_file(
    document_id: int,
    file_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    document = get_owned_document_or_404(db, document_id, current_user)

    document = (
        db.query(Document)
        .filter(
            Document.id == document_id,
            Document.user_id == int(current_user["id"])
        )
        .first()
    )

    if not document:
        raise HTTPException(status_code=404, detail="Dokumen tidak ditemukan")

    file_record = (
        db.query(FileDocument)
        .filter(
            FileDocument.id == file_id,
            FileDocument.dokumen_id == document_id
        )
        .first()
    )

    if not file_record:
        raise HTTPException(status_code=404, detail="File tidak ditemukan")

    if not os.path.exists(file_record.file_path):
        raise HTTPException(status_code=404, detail="File fisik tidak ditemukan di storage")

    return FileResponse(
        path=file_record.file_path,
        media_type="application/pdf",
        filename=file_record.nama_file,
    )

@router.delete("/{document_id}/files/{file_id}")
def delete_document_file(
    document_id: int,
    file_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    document = get_owned_document_or_404(db, document_id, current_user)
    
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

    file_record = (
        db.query(FileDocument)
        .filter(
            FileDocument.id == file_id,
            FileDocument.dokumen_id == document_id,
        )
        .first()
    )

    if not file_record:
        raise HTTPException(status_code=404, detail="File tidak ditemukan")

    deleted_file_name = file_record.nama_file

    if file_record.file_path and os.path.exists(file_record.file_path):
        os.remove(file_record.file_path)

    db.delete(file_record)
    db.commit()

    return {
        "message": "File PDF berhasil dihapus",
        "document_id": document_id,
        "file_id": file_id,
        "deleted_file": deleted_file_name,
    }