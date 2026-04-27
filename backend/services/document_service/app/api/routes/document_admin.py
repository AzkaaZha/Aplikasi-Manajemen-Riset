from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.document import Document
from app.models.file_document import FileDocument
from app.models.template_field import TemplateField
from app.models.document_content import DocumentContent
from app.models.budget import Budget
from app.models.schedule import Schedule
from app.models.output import Output
from app.models.researcher import Researcher
from app.models.partner import Partner
from app.schemas.document_dashboard import DocumentDashboardSummaryResponse
from app.schemas.document_admin import AdminDocumentListResponse
from app.schemas.document_full import DocumentFullDetailResponse
from app.schemas.file_document import FileDocumentResponse

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.get("/dashboard/summary", response_model=DocumentDashboardSummaryResponse)
def get_document_dashboard_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if int(current_user["role_id"]) != 1:
        raise HTTPException(
            status_code=403,
            detail="Hanya admin yang dapat mengakses dashboard"
        )

    total_dokumen = db.query(Document).count()

    total_draft = (
        db.query(Document)
        .filter(Document.status_dokumen == "draft")
        .count()
    )

    total_lengkap = (
        db.query(Document)
        .filter(Document.status_dokumen == "lengkap")
        .count()
    )

    total_file_pdf = db.query(FileDocument).count()

    dokumen_terbaru = (
        db.query(Document)
        .order_by(Document.created_at.desc())
        .limit(5)
        .all()
    )

    return {
        "total_dokumen": total_dokumen,
        "total_draft": total_draft,
        "total_lengkap": total_lengkap,
        "total_file_pdf": total_file_pdf,
        "dokumen_terbaru": dokumen_terbaru,
    }

@router.get("/admin/all", response_model=AdminDocumentListResponse)
def get_all_documents_for_admin(
    keyword: str | None = None,
    status: str | None = None,
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if int(current_user["role_id"]) != 1:
        raise HTTPException(
            status_code=403,
            detail="Hanya admin yang dapat mengakses daftar semua dokumen",
        )

    query = db.query(Document)

    if keyword:
        query = query.filter(Document.judul.like(f"%{keyword}%"))

    if status:
        query = query.filter(Document.status_dokumen == status)

    total = query.count()

    documents = (
        query
        .order_by(Document.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "items": documents,
    }

@router.get("/admin/{document_id}/files", response_model=list[FileDocumentResponse])
def get_admin_document_files(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if int(current_user["role_id"]) != 1:
        raise HTTPException(
            status_code=403,
            detail="Hanya admin yang dapat melihat file dokumen",
        )

    document = (
        db.query(Document)
        .filter(Document.id == document_id)
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

@router.get("/admin/{document_id}/full-detail", response_model=DocumentFullDetailResponse)
def get_admin_document_full_detail(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if int(current_user["role_id"]) != 1:
        raise HTTPException(
            status_code=403,
            detail="Hanya admin yang dapat melihat detail semua dokumen",
        )

    document = (
        db.query(Document)
        .filter(Document.id == document_id)
        .first()
    )

    if not document:
        raise HTTPException(status_code=404, detail="Dokumen tidak ditemukan")

    fields = (
        db.query(TemplateField)
        .filter(TemplateField.template_id == document.template_id)
        .order_by(TemplateField.urutan.asc())
        .all()
    )

    contents = (
        db.query(DocumentContent)
        .filter(DocumentContent.dokumen_id == document_id)
        .all()
    )

    content_map = {
        content.template_field_id: content.isi
        for content in contents
    }

    field_items = []

    for field in fields:
        field_items.append(
            {
                "template_field_id": field.id,
                "nama_field": field.nama_field,
                "label_field": field.label_field,
                "tipe_field": field.tipe_field,
                "wajib": field.wajib,
                "isi": content_map.get(field.id),
            }
        )

    budgets = (
        db.query(Budget)
        .filter(Budget.dokumen_id == document_id)
        .all()
    )

    schedules = (
        db.query(Schedule)
        .filter(Schedule.dokumen_id == document_id)
        .all()
    )

    outputs = (
        db.query(Output)
        .filter(Output.dokumen_id == document_id)
        .all()
    )

    researchers = (
        db.query(Researcher)
        .filter(Researcher.dokumen_id == document_id)
        .all()
    )

    partners = (
        db.query(Partner)
        .filter(Partner.dokumen_id == document_id)
        .all()
    )

    return {
        "id": document.id,
        "user_id": document.user_id,
        "jenis_dokumen_id": document.jenis_dokumen_id,
        "template_id": document.template_id,
        "judul": document.judul,
        "status_dokumen": document.status_dokumen,
        "terakhir_autosave": document.terakhir_autosave,
        "created_at": document.created_at,
        "updated_at": document.updated_at,
        "fields": field_items,
        "budgets": budgets,
        "schedules": schedules,
        "outputs": outputs,
        "researchers": researchers,
        "partners": partners,
    }

