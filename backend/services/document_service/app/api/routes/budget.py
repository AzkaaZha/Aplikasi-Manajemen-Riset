from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.document import Document
from app.models.budget import Budget
from app.schemas.budget import (
    CreateBudgetRequest,
    UpdateBudgetRequest,
    BudgetResponse
)

router = APIRouter(prefix="/documents/{document_id}/budgets", tags=["Budgets"])


def get_user_document(document_id: int, db: Session, current_user):
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == int(current_user["id"])
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Dokumen tidak ditemukan")

    return document


@router.post("/", response_model=BudgetResponse)
def create_budget(
    document_id: int,
    payload: CreateBudgetRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    get_user_document(document_id, db, current_user)

    total = payload.volume * payload.biaya_satuan

    budget = Budget(
        dokumen_id=document_id,
        jenis_pembelanjaan=payload.jenis_pembelanjaan,
        item=payload.item,
        satuan=payload.satuan,
        volume=payload.volume,
        biaya_satuan=payload.biaya_satuan,
        total=total
    )

    db.add(budget)
    db.commit()
    db.refresh(budget)

    return budget


@router.get("/", response_model=list[BudgetResponse])
def get_budgets(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    get_user_document(document_id, db, current_user)

    budgets = db.query(Budget).filter(
        Budget.dokumen_id == document_id
    ).all()

    return budgets


@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(
    document_id: int,
    budget_id: int,
    payload: UpdateBudgetRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    get_user_document(document_id, db, current_user)

    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.dokumen_id == document_id
    ).first()

    if not budget:
        raise HTTPException(status_code=404, detail="Anggaran tidak ditemukan")

    if payload.jenis_pembelanjaan is not None:
        budget.jenis_pembelanjaan = payload.jenis_pembelanjaan
    if payload.item is not None:
        budget.item = payload.item
    if payload.satuan is not None:
        budget.satuan = payload.satuan
    if payload.volume is not None:
        budget.volume = payload.volume
    if payload.biaya_satuan is not None:
        budget.biaya_satuan = payload.biaya_satuan

    budget.total = budget.volume * budget.biaya_satuan

    db.commit()
    db.refresh(budget)

    return budget


@router.delete("/{budget_id}")
def delete_budget(
    document_id: int,
    budget_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    get_user_document(document_id, db, current_user)

    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.dokumen_id == document_id
    ).first()

    if not budget:
        raise HTTPException(status_code=404, detail="Anggaran tidak ditemukan")

    db.delete(budget)
    db.commit()

    return {
        "message": "Anggaran berhasil dihapus",
        "budget_id": budget_id
    }