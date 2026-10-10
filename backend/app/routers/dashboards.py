from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.appointment import Appointment
from app.models.medical_record import MedicalRecord
from app.models.lab_test import LabTest
from app.models.lab_report import LabReport
from app.models.prescription import Prescription
from app.models.medication_order import MedicationOrder
from app.models.permission_request import PermissionRequest
from app.models.ai_recommendation import AIRecommendation
from app.models.notification import Notification
from app.models.organization import Organization
from app.dependencies.auth_deps import get_current_user

router = APIRouter(prefix="/dashboards", tags=["Dashboards"])

@router.get("/patient")
def get_patient_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = current_user.patient_profile
    patient_id = patient.PatientID if patient else None

    if not patient_id:
        # Fallback to demo patient or return zero metrics
        return {
            "profile": {"fullName": current_user.FullName, "email": current_user.Email, "role": current_user.Role},
            "metrics": {"appointments": 0, "records": 0, "labReports": 0, "prescriptions": 0, "medicationOrders": 0, "notifications": 0}
        }

    appointments = db.query(Appointment).filter(Appointment.PatientID == patient_id).all()
    records = db.query(MedicalRecord).filter(MedicalRecord.PatientID == patient_id).all()
    
    lab_tests = db.query(LabTest).filter(LabTest.PatientID == patient_id).all()
    test_ids = [t.TestID for t in lab_tests]
    reports = db.query(LabReport).filter(LabReport.TestID.in_(test_ids)).all() if test_ids else []

    prescriptions = db.query(Prescription).filter(Prescription.PatientID == patient_id).all()
    orders = db.query(MedicationOrder).filter(MedicationOrder.PatientID == patient_id).all()
    notifications = db.query(Notification).filter(Notification.UserID == current_user.UserID).all()

    return {
        "profile": {
            "patientID": patient_id,
            "fullName": current_user.FullName,
            "email": current_user.Email,
            "phone": current_user.Phone,
            "gender": patient.Gender,
            "dateOfBirth": patient.DateOfBirth
        },
        "metrics": {
            "appointments": len(appointments),
            "records": len(records),
            "labReports": len(reports),
            "prescriptions": len(prescriptions),
            "medicationOrders": len(orders),
            "notifications": len([n for n in notifications if not n.IsRead])
        },
        "recentAppointments": [{"id": a.AppointmentID, "date": str(a.AppointmentDate), "status": a.Status, "reason": a.Reason} for a in appointments[:5]],
        "recentRecords": [{"id": r.RecordID, "date": str(r.RecordDate), "symptoms": r.Symptoms} for r in records[:5]]
    }

@router.get("/doctor")
def get_doctor_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doctor = current_user.doctor_profile
    doctor_id = doctor.DoctorID if doctor else None

    if not doctor_id:
        return {
            "profile": {"fullName": current_user.FullName, "email": current_user.Email, "role": current_user.Role},
            "metrics": {"appointments": 0, "patients": 0, "pendingRequests": 0, "aiRecommendationsAwaitingReview": 0}
        }

    appointments = db.query(Appointment).filter(Appointment.DoctorID == doctor_id).all()
    pending_requests = db.query(PermissionRequest).filter(PermissionRequest.DoctorID == doctor_id, PermissionRequest.Status == "PENDING").all()
    ai_recs = db.query(AIRecommendation).filter(AIRecommendation.Status == "PENDING").all()

    patient_ids = list(set([a.PatientID for a in appointments]))
    patients = db.query(Patient).filter(Patient.PatientID.in_(patient_ids)).all() if patient_ids else []

    return {
        "profile": {
            "doctorID": doctor_id,
            "fullName": current_user.FullName,
            "email": current_user.Email,
            "specialty": doctor.Specialty,
            "licenseNumber": doctor.LicenseNumber
        },
        "metrics": {
            "appointments": len(appointments),
            "patients": len(patients),
            "pendingRequests": len(pending_requests),
            "aiRecommendationsAwaitingReview": len(ai_recs)
        },
        "upcomingAppointments": [{"id": a.AppointmentID, "patientID": a.PatientID, "date": str(a.AppointmentDate), "status": a.Status} for a in appointments[:5]],
        "pendingRequests": [{"id": p.RequestID, "patientID": p.PatientID, "reason": p.Reason, "requestedAt": str(p.RequestedAt)} for p in pending_requests[:5]]
    }

@router.get("/hospital")
def get_hospital_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return {
        "metrics": {
            "totalUsers": db.query(User).count(),
            "patients": db.query(Patient).count(),
            "doctors": db.query(Doctor).count(),
            "organizations": db.query(Organization).count(),
            "appointments": db.query(Appointment).count(),
            "medicalRecords": db.query(MedicalRecord).count()
        }
    }

@router.get("/laboratory")
def get_laboratory_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tests = db.query(LabTest).all()
    reports = db.query(LabReport).all()
    return {
        "metrics": {
            "totalTests": len(tests),
            "pendingTests": len([t for t in tests if t.Status in ["ORDERED", "IN_PROGRESS"]]),
            "completedTests": len([t for t in tests if t.Status == "COMPLETED"]),
            "totalReports": len(reports)
        },
        "recentTests": [{"id": t.TestID, "patientID": t.PatientID, "testName": t.TestName, "status": t.Status} for t in tests[:5]]
    }

@router.get("/pharmacy")
def get_pharmacy_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    orders = db.query(MedicationOrder).all()
    prescriptions = db.query(Prescription).all()
    return {
        "metrics": {
            "totalOrders": len(orders),
            "pendingOrders": len([o for o in orders if o.Status == "PENDING"]),
            "readyOrders": len([o for o in orders if o.Status == "READY"]),
            "completedOrders": len([o for o in orders if o.Status == "COMPLETED"]),
            "totalPrescriptions": len(prescriptions)
        },
        "recentOrders": [{"id": o.OrderID, "patientID": o.PatientID, "status": o.Status, "date": str(o.OrderDate)} for o in orders[:5]]
    }
