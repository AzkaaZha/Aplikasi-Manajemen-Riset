from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class FieldContentItem(BaseModel):
    template_field_id: int
    nama_field: str
    label_field: str
    tipe_field: str
    wajib: int
    isi: Optional[str] = None

class BudgetItem(BaseModel):
    id: int
    jenis_pembelanjaan: str
    item: str
    satuan: str
    volume: int
    biaya_satuan: Decimal
    total: Decimal

class ScheduleItem(BaseModel):
    id: int
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

class OutputItem(BaseModel):
    id: int
    kategori_luaran: str
    tahun_luaran: int
    jenis_luaran: str
    status_target: str
    keterangan: Optional[str] = None

class ResearcherItem(BaseModel):
    id: int
    nama: str
    peran: str
    institusi: Optional[str] = None
    program_studi: Optional[str] = None
    bidang_tugas: Optional[str] = None
    id_sinta: Optional[str] = None
    h_index: Optional[int] = None
    nidn_nip_nim: Optional[str] = None

class PartnerItem(BaseModel):
    id: int
    nama_mitra: str
    jenis_mitra: Optional[str] = None
    alamat: Optional[str] = None
    keterangan: Optional[str] = None

class DocumentFullDetailResponse(BaseModel):
    id: int
    user_id: int
    jenis_dokumen_id: int
    template_id: int
    judul: str
    status_dokumen: str
    terakhir_autosave: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    fields: List[FieldContentItem]
    budgets: List[BudgetItem]
    schedules: List[ScheduleItem]
    outputs: List[OutputItem]
    researchers: List[ResearcherItem]
    partners: List[PartnerItem]