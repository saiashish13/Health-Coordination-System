from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.lab_test import LabTest
from app.models.lab_report import LabReport
from app.models.patient import Patient
from app.models.user import User
from app.schemas.lab import LabTestOut, LabTestCreate, LabTestStatusUpdate, LabReportOut, LabReportCreate
from app.dependencies.auth_deps import get_current_user
from app.utils.storage import save_uploaded_file
from app.services.notification_service import notification_service
from app.services.audit_service import audit_service

router = APIRouter(prefix="", tags=["Laboratory"])

@router.get("/lab-tests", response_model=List[LabTestOut])
def get_lab_tests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.Role == "PATIENT" and current_user.patient_profile:
        return db.query(LabTest).filter(LabTest.PatientID == current_user.patient_profile.PatientID).all()
    elif current_user.Role == "DOCTOR" and current_user.doctor_profile:
        return db.query(LabTest).filter(LabTest.DoctorID == current_user.doctor_profile.DoctorID).all()
    return db.query(LabTest).all()

@router.post("/lab-tests", response_model=LabTestOut)
def create_lab_test(
    req: LabTestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = db.query(Patient).filter(Patient.PatientID == req.PatientID).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    doctor_id = req.DoctorID
    if current_user.Role == "DOCTOR" and current_user.doctor_profile:
        doctor_id = current_user.doctor_profile.DoctorID

    lab_test = LabTest(
        PatientID=req.PatientID,
        DoctorID=doctor_id,
        OrganizationID=req.OrganizationID,
        TestName=req.TestName,
        Status="ORDERED"
    )
    db.add(lab_test)
    db.commit()
    db.refresh(lab_test)

    if patient.user:
        notification_service.create_notification(
            db, patient.user.UserID, "Lab Test Ordered", f"Lab test '{req.TestName}' has been ordered."
        )

    audit_service.log_access(db, current_user.UserID, "LabTest", req.PatientID, lab_test.TestID, "ADD")
    return lab_test

@router.get("/lab-tests/{test_id}", response_model=LabTestOut)
def get_lab_test(
    test_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    test = db.query(LabTest).filter(LabTest.TestID == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Lab test not found")
    return test

@router.patch("/lab-tests/{test_id}/status", response_model=LabTestOut)
def update_lab_test_status(
    test_id: int,
    req: LabTestStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    test = db.query(LabTest).filter(LabTest.TestID == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Lab test not found")

    status_upper = req.Status.upper()
    valid_statuses = ["ORDERED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]
    if status_upper not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    test.Status = status_upper
    db.commit()
    db.refresh(test)

    if test.patient and test.patient.user:
        notification_service.create_notification(
            db, test.patient.user.UserID, "Lab Test Status Updated", f"Lab test '{test.TestName}' status changed to {status_upper}"
        )

    return test

@router.get("/lab-reports", response_model=List[LabReportOut])
def get_all_lab_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.Role == "PATIENT" and current_user.patient_profile:
        tests = db.query(LabTest).filter(LabTest.PatientID == current_user.patient_profile.PatientID).all()
        t_ids = [t.TestID for t in tests]
        audit_service.log_access(db, current_user.UserID, "LabReport", current_user.patient_profile.PatientID, action="VIEW")
        return db.query(LabReport).filter(LabReport.TestID.in_(t_ids)).all() if t_ids else []
    return db.query(LabReport).all()

@router.post("/lab-reports", response_model=LabReportOut)
def create_lab_report(
    req: LabReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    test = db.query(LabTest).filter(LabTest.TestID == req.TestID).first()
    if not test:
        raise HTTPException(status_code=404, detail="Lab test not found")

    report = LabReport(
        TestID=req.TestID,
        Results=req.Results,
        ReportFileURL=req.ReportFileURL
    )
    db.add(report)
    test.Status = "COMPLETED"
    db.commit()
    db.refresh(report)

    if test.patient and test.patient.user:
        notification_service.create_notification(
            db, test.patient.user.UserID, "Lab Report Ready", f"Lab report for '{test.TestName}' is now available."
        )

    audit_service.log_access(db, current_user.UserID, "LabReport", test.PatientID, report.ReportID, "ADD")
    return report

@router.get("/lab-reports/{report_id}", response_model=LabReportOut)
def get_lab_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(LabReport).filter(LabReport.ReportID == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Lab report not found")

    patient_id = report.lab_test.PatientID if report.lab_test else None
    audit_service.log_access(db, current_user.UserID, "LabReport", patient_id, report_id, "VIEW")
    return report

@router.get("/lab-tests/{test_id}/report", response_model=LabReportOut)
def get_report_by_test(
    test_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(LabReport).filter(LabReport.TestID == test_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Lab report not found for this test")

    patient_id = report.lab_test.PatientID if report.lab_test else None
    audit_service.log_access(db, current_user.UserID, "LabReport", patient_id, report.ReportID, "VIEW")
    return report

@router.post("/lab-reports/{report_id}/file", response_model=LabReportOut)
def upload_lab_report_file(
    report_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(LabReport).filter(LabReport.ReportID == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Lab report not found")

    file_url = save_uploaded_file(file)
    report.ReportFileURL = file_url
    db.commit()
    db.refresh(report)

    patient_id = report.lab_test.PatientID if report.lab_test else None
    audit_service.log_access(db, current_user.UserID, "LabReport", patient_id, report_id, "DOWNLOAD")
    return report
