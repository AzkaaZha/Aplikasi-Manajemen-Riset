from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.document import Document
from app.models.partner import Partner
from app.schemas.partner import (
    CreatePartnerRequest,
    UpdatePartnerRequest,
    PartnerResponse
)

router = APIRouter(prefix="/documents/{document_id}/partners", tags=["Partners"])


def get_user_document(document_id: int, db: Session, current_user):
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == int(current_user["id"])
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Dokumen tidak ditemukan")

    return document


@router.post("/", response_model=PartnerResponse)
def create_partner(
    document_id: int,
    payload: CreatePartnerRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    get_user_document(document_id, db, current_user)

    partner = Partner(
        dokumen_id=document_id,
        nama_mitra=payload.nama_mitra,
        jenis_mitra=payload.jenis_mitra,
        alamat=payload.alamat,
        keterangan=payload.keterangan
    )

    db.add(partner)
    db.commit()
    db.refresh(partner)

    return partner


@router.get("/", response_model=list[PartnerResponse])
def get_partners(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    get_user_document(document_id, db, current_user)

    return db.query(Partner).filter(
        Partner.dokumen_id == document_id
    ).all()


@router.put("/{partner_id}", response_model=PartnerResponse)
def update_partner(
    document_id: int,
    partner_id: int,
    payload: UpdatePartnerRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    get_user_document(document_id, db, current_user)

    partner = db.query(Partner).filter(
        Partner.id == partner_id,
        Partner.dokumen_id == document_id
    ).first()

    if not partner:
        raise HTTPException(status_code=404, detail="Mitra tidak ditemukan")

    data = payload.model_dump(exclude_unset=True)

    for key, value in data.items():
        setattr(partner, key, value)

    db.commit()
    db.refresh(partner)

    return partner


@router.delete("/{partner_id}")
def delete_partner(
    document_id: int,
    partner_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    get_user_document(document_id, db, current_user)

    partner = db.query(Partner).filter(
        Partner.id == partner_id,
        Partner.dokumen_id == document_id
    ).first()

    if not partner:
        raise HTTPException(status_code=404, detail="Mitra tidak ditemukan")

    db.delete(partner)
    db.commit()

    return {
        "message": "Mitra berhasil dihapus",
        "partner_id": partner_id
    }