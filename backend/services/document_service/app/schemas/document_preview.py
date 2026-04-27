from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from decimal import Decimal

class PreviewBudgetItem(BaseModel):
    jenis_pembelanjaan: str
    item: str
    satuan: str
    volume: int
    biaya_satuan: Decimal
    total: Decimal

class PreviewScheduleItem(BaseModel):
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

class PreviewOutputItem(BaseModel):
    kategori_luaran: str
    tahun_luaran: int
    jenis_luaran: str
    status_target: str
    keterangan: Optional[str] = None

class PreviewResearcherItem(BaseModel):
    nama: str
    peran: str
    institusi: Optional[str] = None
    program_studi: Optional[str] = None
    bidang_tugas: Optional[str] = None
    id_sinta: Optional[str] = None
    h_index: Optional[int] = None
    nidn_nip_nim: Optional[str] = None

class PreviewPartnerItem(BaseModel):
    nama_mitra: str
    jenis_mitra: Optional[str] = None
    alamat: Optional[str] = None
    keterangan: Optional[str] = None

class DocumentPreviewResponse(BaseModel):
    judul: str
    status_dokumen: str

    judul_penelitian: Optional[str] = None
    bidang_fokus_rirn: Optional[str] = None
    tema_penelitian: Optional[str] = None
    topik_penelitian: Optional[str] = None
    rumpun_bidang_ilmu: Optional[str] = None
    target_akhir_tkt: Optional[str] = None
    lama_penelitian: Optional[str] = None
    dana_penelitian: Optional[str] = None
    ringkasan: Optional[str] = None
    kata_kunci: Optional[str] = None
    latar_belakang: Optional[str] = None
    tinjauan_pustaka: Optional[str] = None
    metode_penelitian: Optional[str] = None
    daftar_pustaka: Optional[str] = None
    jenis_dokumen_id: int | None = None
    template_id: int | None = None
    parent_dokumen_id: int | None = None
    contents: dict[str, Any] = {}
    parent_contents: dict[str, Any] = {}
    progress_dokumen_id: Optional[int] = None
    progress_contents: Dict[str, Any] = {}

    pengusul: List[PreviewResearcherItem]
    mitra: List[PreviewPartnerItem]
    luaran: List[PreviewOutputItem]
    anggaran: List[PreviewBudgetItem]
    jadwal: List[PreviewScheduleItem]