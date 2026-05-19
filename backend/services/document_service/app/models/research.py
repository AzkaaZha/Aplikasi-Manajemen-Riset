from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from app.db.session import Base


class Research(Base):
    __tablename__ = "penelitian"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    judul_penelitian = Column(String(255), nullable=False)
    tahun = Column(String(10), nullable=True)
    status_penelitian = Column(
        Enum("draft", "berjalan", "selesai"),
        nullable=False,
        default="draft"
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )