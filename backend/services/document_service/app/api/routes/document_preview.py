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
<<<<<<< HEAD
    try:
        from sqlalchemy.orm import aliased
        from app.models.research import Research
        from app.models.template import Template

        # Explicit aliases to prevent ID conflicts (Point 6)
        dokumen = aliased(Document, name="dokumen")
        penelitian = aliased(Research, name="penelitian")
        templates = aliased(Template, name="templates")
=======
    document = get_owned_document_or_404(db, document_id, current_user)
>>>>>>> 49aba3087b3f855aa889c564c1139967a45e6cc4

        result = (
            db.query(dokumen, penelitian, templates)
            .outerjoin(penelitian, dokumen.penelitian_id == penelitian.id)
            .outerjoin(templates, dokumen.template_id == templates.id)
            .filter(
                dokumen.id == document_id,
                dokumen.user_id == int(current_user["id"])
            )
            .first()
        )

        if not result:
            raise HTTPException(status_code=404, detail="Dokumen tidak ditemukan")

        document, penelitian_obj, template_obj = result

        # Fallback to active template if template_id is null/None/0 (Point 4)
        resolved_template_id = document.template_id
        if not resolved_template_id:
            active_template = (
                db.query(Template)
                .filter(
                    Template.jenis_dokumen_id == document.jenis_dokumen_id,
                    Template.status_aktif == 1
                )
                .order_by(Template.id.desc())
                .first()
            )
            if active_template:
                resolved_template_id = active_template.id

        # Query TemplateField strictly using the resolved template_id (Point 5)
        fields = []
        if resolved_template_id:
            fields = (
                db.query(TemplateField)
                .filter(TemplateField.template_id == resolved_template_id)
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
                    "isi": content_map.get(field.id) or "",
                }
            )

        budgets = db.query(Budget).filter(Budget.dokumen_id == document_id).all()
        schedules = db.query(Schedule).filter(Schedule.dokumen_id == document_id).all()
        outputs = db.query(Output).filter(Output.dokumen_id == document_id).all()
        researchers = db.query(Researcher).filter(Researcher.dokumen_id == document_id).all()
        partners = db.query(Partner).filter(Partner.dokumen_id == document_id).all()

        return {
            "id": document.id,
            "user_id": document.user_id,
            "jenis_dokumen_id": document.jenis_dokumen_id,
            "template_id": resolved_template_id or 0,
            "judul": document.judul or "Tanpa Judul",
            "status_dokumen": document.status_dokumen or "draft",
            "terakhir_autosave": document.terakhir_autosave,
            "created_at": document.created_at,
            "updated_at": document.updated_at,
            "parent_dokumen_id": document.parent_dokumen_id,
            "penelitian_id": document.penelitian_id,
            "fields": field_items,
            "budgets": budgets or [],
            "schedules": schedules or [],
            "outputs": outputs or [],
            "researchers": researchers or [],
            "partners": partners or [],
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print("ERROR IN GET DOCUMENT FULL DETAIL:")
        traceback.print_exc() # Point 10
        raise HTTPException(status_code=500, detail=f"Gagal mengambil detail dokumen: {str(e)}") # Point 9

def get_content_by_key(db: Session, document: Document, template_id: int):
    # Query TemplateField strictly using the resolved template_id (Point 5)
    fields = []
    if template_id:
        fields = (
            db.query(TemplateField)
            .filter(TemplateField.template_id == template_id)
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
                content_by_key[key] = content.isi or ""

    return content_by_key

@router.get("/{document_id}/preview", response_model=DocumentPreviewResponse)
def get_document_preview(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
<<<<<<< HEAD
    try:
        from sqlalchemy.orm import aliased
        from app.models.research import Research
        from app.models.template import Template

        # Explicit aliases to prevent ID conflicts (Point 6)
        dokumen = aliased(Document, name="dokumen")
        penelitian = aliased(Research, name="penelitian")
        templates = aliased(Template, name="templates")

        result = (
            db.query(dokumen, penelitian, templates)
            .outerjoin(penelitian, dokumen.penelitian_id == penelitian.id)
            .outerjoin(templates, dokumen.template_id == templates.id)
            .filter(
                dokumen.id == document_id,
                dokumen.user_id == int(current_user["id"])
            )
            .first()
        )

        if not result:
            raise HTTPException(status_code=404, detail="Dokumen tidak ditemukan")

        document, penelitian_obj, template_obj = result
=======
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
>>>>>>> 49aba3087b3f855aa889c564c1139967a45e6cc4

        # Fallback to active template if template_id is null/None/0 (Point 4)
        resolved_template_id = document.template_id
        if not resolved_template_id:
            active_template = (
                db.query(Template)
                .filter(
                    Template.jenis_dokumen_id == document.jenis_dokumen_id,
                    Template.status_aktif == 1
                )
                .order_by(Template.id.desc())
                .first()
            )
            if active_template:
                resolved_template_id = active_template.id

        current_contents = get_content_by_key(db, document, resolved_template_id)

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

<<<<<<< HEAD
            if progress_document:
                prog_template_id = progress_document.template_id
                if not prog_template_id:
                    active_template = (
                        db.query(Template)
                        .filter(
                            Template.jenis_dokumen_id == progress_document.jenis_dokumen_id,
                            Template.status_aktif == 1
                        )
                        .order_by(Template.id.desc())
                        .first()
                    )
                    if active_template:
                        prog_template_id = active_template.id
                progress_contents = get_content_by_key(db, progress_document, prog_template_id)
=======
    total_budget = sum([b.total for b in budgets]) if budgets else 0

    return {
        "judul": document.judul,
        "status_dokumen": document.status_dokumen,
        "jenis_dokumen_id": document.jenis_dokumen_id,
        "template_id": document.template_id,
        "parent_dokumen_id": document.parent_dokumen_id,
>>>>>>> 49aba3087b3f855aa889c564c1139967a45e6cc4

        if document.parent_dokumen_id:
            parent_document = (
                db.query(Document)
                .filter(
                    Document.id == document.parent_dokumen_id,
                    Document.user_id == int(current_user["id"]),
                )
                .first()
            )

<<<<<<< HEAD
            if parent_document:
                parent_template_id = parent_document.template_id
                if not parent_template_id:
                    active_template = (
                        db.query(Template)
                        .filter(
                            Template.jenis_dokumen_id == parent_document.jenis_dokumen_id,
                            Template.status_aktif == 1
                        )
                        .order_by(Template.id.desc())
                        .first()
                    )
                    if active_template:
                        parent_template_id = active_template.id
                parent_contents = get_content_by_key(db, parent_document, parent_template_id)
=======
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
>>>>>>> 49aba3087b3f855aa889c564c1139967a45e6cc4

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

        # Robust mapping of optional fields to prevent 500 render errors (Points 7 & 8)
        preview_data = {
            "judul": document.judul or "Tanpa Judul",
            "status_dokumen": document.status_dokumen or "draft",
            "jenis_dokumen_id": document.jenis_dokumen_id,
            "template_id": resolved_template_id or 0,
            "parent_dokumen_id": document.parent_dokumen_id,

            "contents": current_contents or {},
            "parent_contents": parent_contents or {},

            "judul_penelitian": source_contents.get("judul_penelitian") or source_document.judul or "Tanpa Judul",
            "bidang_fokus_rirn": source_contents.get("bidang_fokus_rirn") or "",
            "tema_penelitian": source_contents.get("tema_penelitian") or "",
            "topik_penelitian": source_contents.get("topik_penelitian") or "",
            "rumpun_bidang_ilmu": source_contents.get("rumpun_bidang_ilmu") or "",
            "target_akhir_tkt": source_contents.get("target_akhir_tkt") or "",
            "lama_penelitian": source_contents.get("lama_penelitian") or "",
            "dana_penelitian": source_contents.get("dana_penelitian") or (str(int(sum([b.total for b in budgets]))) if budgets else ""),
            "ringkasan": source_contents.get("ringkasan") or "",
            "kata_kunci": source_contents.get("kata_kunci") or "",
            "latar_belakang": source_contents.get("latar_belakang") or "",
            "tinjauan_pustaka": source_contents.get("tinjauan_pustaka") or "",
            "metode_penelitian": source_contents.get("metode_penelitian") or "",
            "daftar_pustaka": source_contents.get("daftar_pustaka") or "",

            "pengusul": researchers if researchers is not None else [],
            "mitra": partners if partners is not None else [],
            "luaran": outputs if outputs is not None else [],
            "anggaran": budgets if budgets is not None else [],
            "jadwal": schedules if schedules is not None else [],

            "progress_dokumen_id": progress_document.id if progress_document else None,
            "progress_contents": progress_contents or {},
        }
        return preview_data
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print("ERROR IN GET DOCUMENT PREVIEW:")
        traceback.print_exc() # Point 10
        raise HTTPException(status_code=500, detail=f"Gagal mengambil preview dokumen: {str(e)}") # Point 9