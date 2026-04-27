from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.document import Document
from app.models.template_field import TemplateField
from app.models.document_content import DocumentContent
from app.models.budget import Budget
from app.models.schedule import Schedule
from app.models.output import Output
from app.models.researcher import Researcher
from app.models.partner import Partner
from app.schemas.document_full import DocumentFullDetailResponse
from app.schemas.document_preview import DocumentPreviewResponse
import json

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.get("/{document_id}/full-detail", response_model=DocumentFullDetailResponse)
def get_document_full_detail(
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

    content_map = {content.template_field_id: content.isi for content in contents}

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

    budgets = db.query(Budget).filter(Budget.dokumen_id == document_id).all()

    schedules = db.query(Schedule).filter(Schedule.dokumen_id == document_id).all()

    outputs = db.query(Output).filter(Output.dokumen_id == document_id).all()

    researchers = (
        db.query(Researcher).filter(Researcher.dokumen_id == document_id).all()
    )

    partners = db.query(Partner).filter(Partner.dokumen_id == document_id).all()

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

def get_content_by_key(db: Session, document: Document):
    fields = (
        db.query(TemplateField)
        .filter(TemplateField.template_id == document.template_id)
        .all()
    )

    contents = (
        db.query(DocumentContent)
        .filter(DocumentContent.dokumen_id == document.id)
        .all()
    )

    field_key_map = {field.id: field.nama_field for field in fields}

    content_by_key = {}

    for content in contents:
        key = field_key_map.get(content.template_field_id)

        if key:
            if key == "hasil_penelitian_pilihan" and content.isi:
                try:
                    content_by_key[key] = json.loads(content.isi)
                except json.JSONDecodeError:
                    content_by_key[key] = []
            else:
                content_by_key[key] = content.isi

    return content_by_key

@router.get("/{document_id}/preview", response_model=DocumentPreviewResponse)
def get_document_preview(
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

    current_contents = get_content_by_key(db, document)

    parent_document = None
    parent_contents = {}

    progress_document = None
    progress_contents = {}

    if document.jenis_dokumen_id == 3 and document.parent_dokumen_id:
        progress_document = (
            db.query(Document)
            .filter(
                Document.parent_dokumen_id == document.parent_dokumen_id,
                Document.jenis_dokumen_id == 2,
                Document.user_id == int(current_user["id"]),
            )
            .order_by(Document.created_at.desc())
            .first()
        )

        if progress_document:
            progress_contents = get_content_by_key(db, progress_document)

    if document.parent_dokumen_id:
        parent_document = (
            db.query(Document)
            .filter(
                Document.id == document.parent_dokumen_id,
                Document.user_id == int(current_user["id"]),
            )
            .first()
        )

        if parent_document:
            parent_contents = get_content_by_key(db, parent_document)

    source_document = parent_document if parent_document else document
    source_contents = parent_contents if parent_document else current_contents

    researchers = (
        db.query(Researcher)
        .filter(Researcher.dokumen_id == source_document.id)
        .all()
    )

    partners = (
        db.query(Partner)
        .filter(Partner.dokumen_id == source_document.id)
        .all()
    )

    outputs = (
        db.query(Output)
        .filter(Output.dokumen_id == source_document.id)
        .all()
    )

    budgets = (
        db.query(Budget)
        .filter(Budget.dokumen_id == source_document.id)
        .all()
    )

    schedules = (
        db.query(Schedule)
        .filter(Schedule.dokumen_id == source_document.id)
        .all()
    )

    return {
        "judul": document.judul,
        "status_dokumen": document.status_dokumen,
        "jenis_dokumen_id": document.jenis_dokumen_id,
        "template_id": document.template_id,
        "parent_dokumen_id": document.parent_dokumen_id,

        "contents": current_contents,
        "parent_contents": parent_contents,

        "judul_penelitian": source_contents.get("judul_penelitian") or source_document.judul,
        "bidang_fokus_rirn": source_contents.get("bidang_fokus_rirn"),
        "tema_penelitian": source_contents.get("tema_penelitian"),
        "topik_penelitian": source_contents.get("topik_penelitian"),
        "rumpun_bidang_ilmu": source_contents.get("rumpun_bidang_ilmu"),
        "target_akhir_tkt": source_contents.get("target_akhir_tkt"),
        "lama_penelitian": source_contents.get("lama_penelitian"),
        "dana_penelitian": source_contents.get("dana_penelitian"),
        "ringkasan": source_contents.get("ringkasan"),
        "kata_kunci": source_contents.get("kata_kunci"),
        "latar_belakang": source_contents.get("latar_belakang"),
        "tinjauan_pustaka": source_contents.get("tinjauan_pustaka"),
        "metode_penelitian": source_contents.get("metode_penelitian"),
        "daftar_pustaka": source_contents.get("daftar_pustaka"),

        "pengusul": researchers,
        "mitra": partners,
        "luaran": outputs,
        "anggaran": budgets,
        "jadwal": schedules,

        "progress_dokumen_id": progress_document.id if progress_document else None,
        "progress_contents": progress_contents,
    }