from pydantic import BaseModel
from typing import List


class MissingFieldItem(BaseModel):
    template_field_id: int
    nama_field: str
    label_field: str


class DocumentValidationResponse(BaseModel):
    document_id: int
    valid: bool
    missing_fields: List[MissingFieldItem]