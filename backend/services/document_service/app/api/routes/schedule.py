from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.document import Document
from app.models.schedule import Schedule
from app.schemas.schedule import (
    CreateScheduleRequest,
    UpdateScheduleRequest,
    ScheduleResponse
)

router = APIRouter(prefix="/documents/{document_id}/schedules", tags=["Schedules"])


def get_user_document(document_id: int, db: Session, current_user):
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == int(current_user["id"])
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Dokumen tidak ditemukan")

    return document


@router.post("/", response_model=ScheduleResponse)
def create_schedule(
    document_id: int,
    payload: CreateScheduleRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    get_user_document(document_id, db, current_user)

    schedule = Schedule(
        dokumen_id=document_id,
        nama_kegiatan=payload.nama_kegiatan,
        bulan_1=payload.bulan_1,
        bulan_2=payload.bulan_2,
        bulan_3=payload.bulan_3,
        bulan_4=payload.bulan_4,
        bulan_5=payload.bulan_5,
        bulan_6=payload.bulan_6,
        bulan_7=payload.bulan_7,
        bulan_8=payload.bulan_8,
        bulan_9=payload.bulan_9,
        bulan_10=payload.bulan_10,
        bulan_11=payload.bulan_11,
        bulan_12=payload.bulan_12
    )

    db.add(schedule)
    db.commit()
    db.refresh(schedule)

    return schedule


@router.get("/", response_model=list[ScheduleResponse])
def get_schedules(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    get_user_document(document_id, db, current_user)

    return db.query(Schedule).filter(
        Schedule.dokumen_id == document_id
    ).all()


@router.put("/{schedule_id}", response_model=ScheduleResponse)
def update_schedule(
    document_id: int,
    schedule_id: int,
    payload: UpdateScheduleRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    get_user_document(document_id, db, current_user)

    schedule = db.query(Schedule).filter(
        Schedule.id == schedule_id,
        Schedule.dokumen_id == document_id
    ).first()

    if not schedule:
        raise HTTPException(status_code=404, detail="Jadwal tidak ditemukan")

    data = payload.model_dump(exclude_unset=True)

    for key, value in data.items():
        setattr(schedule, key, value)

    db.commit()
    db.refresh(schedule)

    return schedule


@router.delete("/{schedule_id}")
def delete_schedule(
    document_id: int,
    schedule_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    get_user_document(document_id, db, current_user)

    schedule = db.query(Schedule).filter(
        Schedule.id == schedule_id,
        Schedule.dokumen_id == document_id
    ).first()

    if not schedule:
        raise HTTPException(status_code=404, detail="Jadwal tidak ditemukan")

    db.delete(schedule)
    db.commit()

    return {
        "message": "Jadwal berhasil dihapus",
        "schedule_id": schedule_id
    }