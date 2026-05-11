from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.api.routes.document_helper import get_owned_document_or_404
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
import re

def parse_basic_markdown(text):
    if not isinstance(text, str):
        return text
    text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', text)
    return text

def strip_html(text):
    if not isinstance(text, str):
        return text
    text = re.sub(r'<[^>]+>', '', text)
    text = text.replace('&nbsp;', ' ').strip()
    return text

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.get("/{document_id}/full-detail", response_model=DocumentFullDetailResponse)
def get_document_full_detail(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    document = get_owned_document_or_404(db, document_id, current_user)

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
    document = get_owned_document_or_404(db, document_id, current_user)

    current_contents = get_content_by_key(db, document)

    parent_document = None
    parent_contents = {}

    progress_document = None
    progress_contents = {}

    if document.jenis_dokumen_id in [2, 3]:
        # Jika dokumen adalah laporan kemajuan atau laporan akhir, parent_document adalah proposal
        parent_document = (
            db.query(Document)
            .filter(
                Document.penelitian_id == document.penelitian_id,
                Document.jenis_dokumen_id == 1,
            )
            .first()
        )

        if parent_document:
            parent_contents = get_content_by_key(db, parent_document)
            
    if document.jenis_dokumen_id == 3:
        # Jika dokumen adalah laporan akhir, ambil juga laporan kemajuan jika ada
        progress_document = (
            db.query(Document)
            .filter(
                Document.penelitian_id == document.penelitian_id,
                Document.jenis_dokumen_id == 2,
            )
            .order_by(Document.created_at.desc())
            .first()
        )

        if progress_document:
            progress_contents = get_content_by_key(db, progress_document)

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

    total_budget = sum([b.total for b in budgets]) if budgets else 0

    return {
        "judul": document.judul,
        "status_dokumen": document.status_dokumen,
        "jenis_dokumen_id": document.jenis_dokumen_id,
        "template_id": document.template_id,
        "parent_dokumen_id": document.parent_dokumen_id,

        "contents": current_contents,
        "parent_contents": parent_contents,

        "judul_penelitian": strip_html(source_contents.get("judul_penelitian")) or source_document.judul,
        "bidang_fokus_rirn": strip_html(source_contents.get("bidang_fokus_rirn")),
        "tema_penelitian": strip_html(source_contents.get("tema_penelitian")),
        "topik_penelitian": strip_html(source_contents.get("topik_penelitian")),
        "rumpun_bidang_ilmu": strip_html(source_contents.get("rumpun_bidang_ilmu")),
        "target_akhir_tkt": strip_html(source_contents.get("target_akhir_tkt")),
        "lama_penelitian": strip_html(source_contents.get("lama_penelitian")),
        "dana_penelitian": total_budget,
        "ringkasan": parse_basic_markdown(source_contents.get("ringkasan")),
        "kata_kunci": parse_basic_markdown(source_contents.get("kata_kunci")),
        "latar_belakang": parse_basic_markdown(source_contents.get("latar_belakang")),
        "tinjauan_pustaka": parse_basic_markdown(source_contents.get("tinjauan_pustaka")),
        "metode_penelitian": parse_basic_markdown(source_contents.get("metode_penelitian")),
        "daftar_pustaka": parse_basic_markdown(source_contents.get("daftar_pustaka")),

        "pengusul": researchers,
        "mitra": partners,
        "luaran": outputs,
        "anggaran": budgets,
        "jadwal": schedules,

        "progress_dokumen_id": progress_document.id if progress_document else None,
        "progress_contents": progress_contents,
    }