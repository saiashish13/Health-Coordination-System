from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.patient import Patient
from app.models.user import User
from app.models.appointment import Appointment
from app.models.medical_record import MedicalRecord
from app.models.diagnosis import Diagnosis
from app.models.lab_test import LabTest
from app.models.lab_report import LabReport
from app.models.prescription import Prescription
from app.models.medication_order import MedicationOrder
from app.models.notification import Notification
from app.models.ai_interaction import AIInteraction
from app.models.ai_recommendation import AIRecommendation
from app.models.patient_doctor_access import PatientDoctorAccess
from app.schemas.patient import PatientOut, PatientUpdate
from app.schemas.appointment import AppointmentOut
from app.schemas.medical_record import MedicalRecordOut
from app.schemas.diagnosis import DiagnosisOut
from app.schemas.lab import LabTestOut, LabReportOut
from app.schemas.prescription import PrescriptionOut
from app.schemas.medication_order import MedicationOrderOut
from app.schemas.notification import NotificationOut
from app.schemas.ai import AIInteractionOut, AIRecommendationOut
from app.dependencies.auth_deps import get_current_user
from app.services.permission_service import permission_service
from app.services.audit_service import audit_service

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.get("", response_model=List[PatientOut])
def get_all_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.Role == "DOCTOR" and current_user.doctor_profile:
        doc_id = current_user.doctor_profile.DoctorID
        # Doctor can see patients who granted ACTIVE access
        active_access = db.query(PatientDoctorAccess).filter(
            PatientDoctorAccess.DoctorID == doc_id,
            PatientDoctorAccess.Status == "ACTIVE"
        ).all()
        allowed_patient_ids = set([a.PatientID for a in active_access])

        # Also patients who have appointments scheduled with this doctor
        appts = db.query(Appointment).filter(Appointment.DoctorID == doc_id).all()
        for appt in appts:
            allowed_patient_ids.add(appt.PatientID)

        if not allowed_patient_ids:
            return []

        return db.query(Patient).filter(Patient.PatientID.in_(list(allowed_patient_ids))).all()

    elif current_user.Role not in ["ADMIN", "DOCTOR", "HOSPITAL"]:
        raise HTTPException(status_code=403, detail="Access denied")

    return db.query(Patient).all()

@router.get("/me", response_model=PatientOut)
def get_patient_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.patient_profile:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    return current_user.patient_profile

@router.get("/{patient_id}", response_model=PatientOut)
def get_patient_by_id(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = db.query(Patient).filter(Patient.PatientID == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Access control
    if current_user.Role == "PATIENT":
        if not current_user.patient_profile or current_user.patient_profile.PatientID != patient_id:
            raise HTTPException(status_code=403, detail="Access denied to other patient profiles")
    elif current_user.Role == "DOCTOR":
        if current_user.doctor_profile:
            has_perm = permission_service.verify_doctor_permission(
                db, patient_id, current_user.doctor_profile.DoctorID, "MEDICAL_RECORD", "VIEW"
            )
            # If not direct permission, check if doctor created appointments or permission exists
            if not has_perm:
                # Log audit attempt
                audit_service.log_access(db, current_user.UserID, "Patient", patient_id, action="UNAUTHORIZED_VIEW_ATTEMPT")
                raise HTTPException(status_code=403, detail="Doctor does not have active patient permission")

    audit_service.log_access(db, current_user.UserID, "Patient", patient_id, action="VIEW")
    return patient

@router.put("/{patient_id}", response_model=PatientOut)
def update_patient_profile(
    patient_id: int,
    req: PatientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = db.query(Patient).filter(Patient.PatientID == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    if current_user.Role == "PATIENT" and (not current_user.patient_profile or current_user.patient_profile.PatientID != patient_id):
        raise HTTPException(status_code=403, detail="Access denied")

    if req.DateOfBirth is not None:
        patient.DateOfBirth = req.DateOfBirth
    if req.Gender is not None:
        patient.Gender = req.Gender
    if req.BloodGroup is not None:
        patient.BloodGroup = req.BloodGroup
    if req.Address is not None:
        patient.Address = req.Address
    if req.EmergencyContact is not None:
        patient.EmergencyContact = req.EmergencyContact

    if req.FullName and patient.user:
        patient.user.FullName = req.FullName
    if req.Phone and patient.user:
        patient.user.Phone = req.Phone

    db.commit()
    db.refresh(patient)
    audit_service.log_access(db, current_user.UserID, "Patient", patient_id, action="EDIT")
    return patient

@router.get("/{patient_id}/appointments", response_model=List[AppointmentOut])
def get_patient_appointments(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Appointment).filter(Appointment.PatientID == patient_id).all()

@router.get("/{patient_id}/medical-records", response_model=List[MedicalRecordOut])
def get_patient_medical_records(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.Role == "DOCTOR" and current_user.doctor_profile:
        if not permission_service.verify_doctor_permission(db, patient_id, current_user.doctor_profile.DoctorID, "MEDICAL_RECORD", "VIEW"):
            # Check active access link
            access = db.query(PatientDoctorAccess).filter(
                PatientDoctorAccess.PatientID == patient_id,
                PatientDoctorAccess.DoctorID == current_user.doctor_profile.DoctorID,
                PatientDoctorAccess.Status == "ACTIVE"
            ).first()
            if not access:
                raise HTTPException(status_code=403, detail="No active doctor permission for patient medical records")

    audit_service.log_access(db, current_user.UserID, "MedicalRecord", patient_id, action="VIEW")
    return db.query(MedicalRecord).filter(MedicalRecord.PatientID == patient_id).all()

@router.get("/{patient_id}/diagnoses", response_model=List[DiagnosisOut])
def get_patient_diagnoses(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.Role == "DOCTOR" and current_user.doctor_profile:
        access = db.query(PatientDoctorAccess).filter(
            PatientDoctorAccess.PatientID == patient_id,
            PatientDoctorAccess.DoctorID == current_user.doctor_profile.DoctorID,
            PatientDoctorAccess.Status == "ACTIVE"
        ).first()
        if not access:
            raise HTTPException(status_code=403, detail="No active doctor permission for patient diagnoses")

    records = db.query(MedicalRecord).filter(MedicalRecord.PatientID == patient_id).all()
    record_ids = [r.RecordID for r in records]
    if not record_ids:
        return []
    audit_service.log_access(db, current_user.UserID, "Diagnosis", patient_id, action="VIEW")
    return db.query(Diagnosis).filter(Diagnosis.RecordID.in_(record_ids)).all()

@router.get("/{patient_id}/lab-tests", response_model=List[LabTestOut])
def get_patient_lab_tests(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(LabTest).filter(LabTest.PatientID == patient_id).all()

@router.get("/{patient_id}/lab-reports", response_model=List[LabReportOut])
def get_patient_lab_reports(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.Role == "DOCTOR" and current_user.doctor_profile:
        access = db.query(PatientDoctorAccess).filter(
            PatientDoctorAccess.PatientID == patient_id,
            PatientDoctorAccess.DoctorID == current_user.doctor_profile.DoctorID,
            PatientDoctorAccess.Status == "ACTIVE"
        ).first()
        if not access:
            raise HTTPException(status_code=403, detail="No active doctor permission for patient lab reports")

    tests = db.query(LabTest).filter(LabTest.PatientID == patient_id).all()
    test_ids = [t.TestID for t in tests]
    if not test_ids:
        return []
    audit_service.log_access(db, current_user.UserID, "LabReport", patient_id, action="VIEW")
    return db.query(LabReport).filter(LabReport.TestID.in_(test_ids)).all()

@router.get("/{patient_id}/prescriptions", response_model=List[PrescriptionOut])
def get_patient_prescriptions(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.Role == "DOCTOR" and current_user.doctor_profile:
        access = db.query(PatientDoctorAccess).filter(
            PatientDoctorAccess.PatientID == patient_id,
            PatientDoctorAccess.DoctorID == current_user.doctor_profile.DoctorID,
            PatientDoctorAccess.Status == "ACTIVE"
        ).first()
        if not access:
            raise HTTPException(status_code=403, detail="No active doctor permission for patient prescriptions")

    audit_service.log_access(db, current_user.UserID, "Prescription", patient_id, action="VIEW")
    return db.query(Prescription).filter(Prescription.PatientID == patient_id).all()

@router.get("/{patient_id}/medication-orders", response_model=List[MedicationOrderOut])
def get_patient_medication_orders(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(MedicationOrder).filter(MedicationOrder.PatientID == patient_id).all()

@router.get("/{patient_id}/notifications", response_model=List[NotificationOut])
def get_patient_notifications(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = db.query(Patient).filter(Patient.PatientID == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return db.query(Notification).filter(Notification.UserID == patient.UserID).all()

@router.get("/{patient_id}/ai-interactions", response_model=List[AIInteractionOut])
def get_patient_ai_interactions(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(AIInteraction).filter(AIInteraction.PatientID == patient_id).all()

@router.get("/{patient_id}/ai-recommendations", response_model=List[AIRecommendationOut])
def get_patient_ai_recommendations(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(AIRecommendation).filter(AIRecommendation.PatientID == patient_id).all()
