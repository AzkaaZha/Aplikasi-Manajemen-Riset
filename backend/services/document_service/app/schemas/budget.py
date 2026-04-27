from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal


class CreateBudgetRequest(BaseModel):
    jenis_pembelanjaan: str
    item: str
    satuan: str
    volume: int
    biaya_satuan: Decimal


class UpdateBudgetRequest(BaseModel):
    jenis_pembelanjaan: Optional[str] = None
    item: Optional[str] = None
    satuan: Optional[str] = None
    volume: Optional[int] = None
    biaya_satuan: Optional[Decimal] = None


class BudgetResponse(BaseModel):
    id: int
    dokumen_id: int
    jenis_pembelanjaan: str
    item: str
    satuan: str
    volume: int
    biaya_satuan: Decimal
    total: Decimal
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True