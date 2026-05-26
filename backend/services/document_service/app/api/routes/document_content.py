from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.api.routes.document_helper import get_owned_document_or_404
from app.models.document import Document
from app.models.document_content import DocumentContent
from app.models.template_field import TemplateField
from app.schemas.document_content import (
    TemplateFieldResponse,
    SaveDocumentContentRequest,
    DocumentContentResponse,
)
from app.schemas.document_validation import DocumentValidationResponse, MissingFieldItem
import bleach

ALLOWED_TAGS = [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'blockquote', 'table', 'thead', 'tbody',
    'tr', 'td', 'th', 'a', 'img'
]

ALLOWED_ATTRIBUTES = {
    '*': ['style', 'class'],
    'a': ['href', 'title', 'target'],
    'img': ['src', 'alt', 'width', 'height']
}

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.get("/{document_id}/fields", response_model=list[TemplateFieldResponse])
def get_document_fields(
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

    return fields

@router.post("/{document_id}/contents")
def save_document_contents(
    document_id: int,
    payload: SaveDocumentContentRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    document = get_owned_document_or_404(db, document_id, current_user)
    

    from app.models.research import Research

    for item in payload.items:
        field = (
            db.query(TemplateField)
            .filter(
                TemplateField.id == item.template_field_id,
                TemplateField.template_id == document.template_id,
            )
            .first()
        )

        if not field:
            raise HTTPException(
                status_code=400,
                detail=f"Template field id {item.template_field_id} tidak valid untuk dokumen ini",
            )
            

        sanitized_isi = bleach.clean(
            item.isi,
            tags=ALLOWED_TAGS,
            attributes=ALLOWED_ATTRIBUTES,
            strip=True
        ) if item.isi else item.isi

        existing_content = (
            db.query(DocumentContent)
            .filter(
                DocumentContent.dokumen_id == document_id,
                DocumentContent.template_field_id == item.template_field_id,
            )
            .first()
        )

        if existing_content:
            existing_content.isi = sanitized_isi
        else:
            new_content = DocumentContent(
                dokumen_id=document_id,
                template_field_id=item.template_field_id,
                isi=sanitized_isi,
            )
            db.add(new_content)
            

        if field.nama_field == 'judul_penelitian' and sanitized_isi:
            plain_text_title = bleach.clean(sanitized_isi, tags=[], strip=True)

            plain_text_title = plain_text_title.replace('&nbsp;', ' ').strip()
            
            research = db.query(Research).filter(Research.id == document.penelitian_id).first()
            if research:
                research.judul_penelitian = plain_text_title
            document.judul = plain_text_title

    db.commit()

    return {"message": "Isi dokumen berhasil disimpan"}

@router.get("/{document_id}/contents", response_model=list[DocumentContentResponse])
def get_document_contents(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    document = get_owned_document_or_404(db, document_id, current_user)
    from app.models.research import Research

    contents = (
        db.query(DocumentContent)
        .filter(DocumentContent.dokumen_id == document_id)
        .all()
    )
    

    research = db.query(Research).filter(Research.id == document.penelitian_id).first()
    judul_field = db.query(TemplateField).filter(
        TemplateField.template_id == document.template_id,
        TemplateField.nama_field == 'judul_penelitian'
    ).first()

    if judul_field and research:
        existing = next((c for c in contents if c.template_field_id == judul_field.id), None)
        if existing:
            existing.isi = research.judul_penelitian
        else:

            contents.append(
                DocumentContent(
                    id=0,
                    dokumen_id=document_id,
                    template_field_id=judul_field.id,
                    isi=research.judul_penelitian
                )
            )

    return contents

@router.get("/{document_id}/validate", response_model=DocumentValidationResponse)
def validate_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    document = get_owned_document_or_404(db, document_id, current_user)

    if not document:
        raise HTTPException(status_code=404, detail="Dokumen tidak ditemukan")

    required_fields = (
        db.query(TemplateField)
        .filter(
            TemplateField.template_id == document.template_id, TemplateField.wajib == 1
        )
        .all()
    )

    contents = (
        db.query(DocumentContent)
        .filter(DocumentContent.dokumen_id == document_id)
        .all()
    )

    content_map = {
        content.template_field_id: (content.isi.strip() if content.isi else "")
        for content in contents
    }

    missing_fields = []

    for field in required_fields:
        isi = content_map.get(field.id, "")
        if not isi:
            missing_fields.append(
                MissingFieldItem(
                    template_field_id=field.id,
                    nama_field=field.nama_field,
                    label_field=field.label_field,
                )
            )

    return DocumentValidationResponse(
        document_id=document.id,
        valid=len(missing_fields) == 0,
        missing_fields=missing_fields,
    )

@router.post("/{document_id}/check-status")
def check_and_update_document_status(
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

    required_fields = (
        db.query(TemplateField)
        .filter(
            TemplateField.template_id == document.template_id, TemplateField.wajib == 1
        )
        .all()
    )

    contents = (
        db.query(DocumentContent)
        .filter(DocumentContent.dokumen_id == document_id)
        .all()
    )

    content_map = {
        content.template_field_id: (content.isi.strip() if content.isi else "")
        for content in contents
    }

    missing_fields = []

    for field in required_fields:
        isi = content_map.get(field.id, "")
        if not isi:
            missing_fields.append(field.label_field)

    if len(missing_fields) == 0:
        document.status_dokumen = "lengkap"
    else:
        document.status_dokumen = "draft"

    db.commit()
    db.refresh(document)

    return {
        "message": "Status dokumen berhasil diperbarui",
        "document_id": document.id,
        "status_dokumen": document.status_dokumen,
        "missing_fields": missing_fields,
    }
