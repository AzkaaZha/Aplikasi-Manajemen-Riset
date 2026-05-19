from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import os
import uuid
from pathlib import Path

router = APIRouter(prefix="/uploads", tags=["Uploads"])

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "static" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

@router.post("/images")
async def upload_image(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    # Get extension
    ext = file.filename.split('.')[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type '{ext}' not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}")

    # Check file size by reading
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB")
    
    # Reset cursor after read
    file.file.seek(0)

    # Generate safe filename
    safe_filename = f"img_{uuid.uuid4().hex}.{ext}"
    file_path = UPLOAD_DIR / safe_filename

    try:
        with open(file_path, "wb") as buffer:
            buffer.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to save image")
    
    # In a real app, this should be an absolute URL or use a proper storage service
    # For this project, returning the static path is sufficient
    file_url = f"/static/uploads/{safe_filename}"
    
    return JSONResponse(content={"url": file_url})
