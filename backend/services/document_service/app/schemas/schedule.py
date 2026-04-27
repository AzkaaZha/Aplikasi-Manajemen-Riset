from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CreateScheduleRequest(BaseModel):
    nama_kegiatan: str
    bulan_1: int = 0
    bulan_2: int = 0
    bulan_3: int = 0
    bulan_4: int = 0
    bulan_5: int = 0
    bulan_6: int = 0
    bulan_7: int = 0
    bulan_8: int = 0
    bulan_9: int = 0
    bulan_10: int = 0
    bulan_11: int = 0
    bulan_12: int = 0


class UpdateScheduleRequest(BaseModel):
    nama_kegiatan: Optional[str] = None
    bulan_1: Optional[int] = None
    bulan_2: Optional[int] = None
    bulan_3: Optional[int] = None
    bulan_4: Optional[int] = None
    bulan_5: Optional[int] = None
    bulan_6: Optional[int] = None
    bulan_7: Optional[int] = None
    bulan_8: Optional[int] = None
    bulan_9: Optional[int] = None
    bulan_10: Optional[int] = None
    bulan_11: Optional[int] = None
    bulan_12: Optional[int] = None


class ScheduleResponse(BaseModel):
    id: int
    dokumen_id: int
    nama_kegiatan: str
    bulan_1: int
    bulan_2: int
    bulan_3: int
    bulan_4: int
    bulan_5: int
    bulan_6: int
    bulan_7: int
    bulan_8: int
    bulan_9: int
    bulan_10: int
    bulan_11: int
    bulan_12: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True