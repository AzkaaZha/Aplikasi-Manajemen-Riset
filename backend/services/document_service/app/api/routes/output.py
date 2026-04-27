from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.document import Document
from app.models.output import Output
from app.schemas.output import (
    CreateOutputRequest,
    UpdateOutputRequest,
    OutputResponse
)

router = APIRouter(prefix="/documents/{document_id}/outputs", tags=["Outputs"])


def get_user_document(document_id: int, db: Session, current_user):
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == int(current_user["id"])
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Dokumen tidak ditemukan")

    return document


@router.post("/", response_model=OutputResponse)
def create_output(
    document_id: int,
    payload: CreateOutputRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    get_user_document(document_id, db, current_user)

    output = Output(
        dokumen_id=document_id,
        kategori_luaran=payload.kategori_luaran,
        tahun_luaran=payload.tahun_luaran,
        jenis_luaran=payload.jenis_luaran,
        status_target=payload.status_target,
        keterangan=payload.keterangan
    )

    db.add(output)
    db.commit()
    db.refresh(output)

    return output


@router.get("/", response_model=list[OutputResponse])
def get_outputs(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    get_user_document(document_id, db, current_user)

    return db.query(Output).filter(
        Output.dokumen_id == document_id
    ).all()


@router.put("/{output_id}", response_model=OutputResponse)
def update_output(
    document_id: int,
    output_id: int,
    payload: UpdateOutputRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    get_user_document(document_id, db, current_user)

    output = db.query(Output).filter(
        Output.id == output_id,
        Output.dokumen_id == document_id
    ).first()

    if not output:
        raise HTTPException(status_code=404, detail="Luaran tidak ditemukan")

    data = payload.model_dump(exclude_unset=True)

    for key, value in data.items():
        setattr(output, key, value)

    db.commit()
    db.refresh(output)

    return output


@router.delete("/{output_id}")
def delete_output(
    document_id: int,
    output_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    get_user_document(document_id, db, current_user)

    output = db.query(Output).filter(
        Output.id == output_id,
        Output.dokumen_id == document_id
    ).first()

    if not output:
        raise HTTPException(status_code=404, detail="Luaran tidak ditemukan")

    db.delete(output)
    db.commit()

    return {
        "message": "Luaran berhasil dihapus",
        "output_id": output_id
    }