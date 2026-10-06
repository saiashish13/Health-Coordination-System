import os
import uuid
from fastapi import UploadFile, HTTPException
from app.config import settings

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".txt", ".csv", ".docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024 # 10 MB

def save_uploaded_file(file: UploadFile) -> str:
    # Validate extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File extension {ext} not allowed. Supported: {', '.join(ALLOWED_EXTENSIONS)}")
    
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    # Save content
    contents = file.file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds maximum limit of 10MB.")
        
    with open(file_path, "wb") as f:
        f.write(contents)
        
    return f"/uploads/{unique_filename}"
