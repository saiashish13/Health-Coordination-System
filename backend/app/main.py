import os
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base
import app.models # Ensure all models are loaded

from app.routers import (
    auth, patients, doctors, organizations, appointments,
    medical_records, diagnoses, lab, medicines, prescriptions,
    medication_orders, permissions, notifications, ai, admin, dashboards
)

# Initialize database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Full-stack Backend API for AI Care Coordination Platform connecting React frontend to SQL Server database."
)

# Configure CORS
origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure upload directory exists and mount static route
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include API Routers under /api
app.include_router(auth.router, prefix="/api")
app.include_router(patients.router, prefix="/api")
app.include_router(doctors.router, prefix="/api")
app.include_router(organizations.router, prefix="/api")
app.include_router(appointments.router, prefix="/api")
app.include_router(medical_records.router, prefix="/api")
app.include_router(diagnoses.router, prefix="/api")
app.include_router(lab.router, prefix="/api")
app.include_router(medicines.router, prefix="/api")
app.include_router(prescriptions.router, prefix="/api")
app.include_router(medication_orders.router, prefix="/api")
app.include_router(permissions.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(dashboards.router, prefix="/api")

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs"
    }

@app.get("/api")
def api_root():
    return RedirectResponse(url="/docs")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import logging
    logging.exception(f"Unhandled error handling request {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "An internal server error occurred.",
            "error_code": "INTERNAL_SERVER_ERROR"
        }
    )
