import sys
import os
from datetime import datetime, timedelta

# Append backend directory to path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app.database import engine, SessionLocal, Base
from app.models.user import User
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.organization import Organization
from app.models.appointment import Appointment
from app.models.medical_record import MedicalRecord
from app.models.diagnosis import Diagnosis
from app.models.lab_test import LabTest
from app.models.lab_report import LabReport
from app.models.medicine import Medicine
from app.models.prescription import Prescription
from app.models.prescription_item import PrescriptionItem
from app.models.medication_order import MedicationOrder
from app.models.permission_request import PermissionRequest
from app.models.patient_doctor_access import PatientDoctorAccess
from app.models.patient_access_permission import PatientAccessPermission
from app.models.ai_interaction import AIInteraction
from app.models.ai_recommendation import AIRecommendation
from app.models.notification import Notification
from app.models.audit_log import AccessAuditLog
from app.security.passwords import hash_password

def seed_database():
    print("Initializing Database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        if db.query(User).first():
            print("Database already contains data. Skipping seed.")
            return

        print("Seeding initial fictional healthcare data...")

        # 1. Organizations
        hosp = Organization(OrganizationName="Central City Hospital", OrganizationType="HOSPITAL", Address="100 Health Ave", Phone="555-0101", Email="info@centralhospital.org")
        lab_org = Organization(OrganizationName="BioTech Diagnostics Lab", OrganizationType="LAB", Address="200 Science Park", Phone="555-0202", Email="lab@biotechdiag.com")
        pharm = Organization(OrganizationName="CarePlus Pharmacy", OrganizationType="PHARMACY", Address="300 Main St", Phone="555-0303", Email="orders@carepluspharm.com")
        db.add_all([hosp, lab_org, pharm])
        db.commit()
        db.refresh(hosp)
        db.refresh(lab_org)
        db.refresh(pharm)

        # 2. Users & Profiles
        default_pwd = hash_password("password123")

        # Admin
        admin_user = User(FullName="System Administrator", Email="admin@healthcare.com", PasswordHash=default_pwd, Role="ADMIN", Phone="555-9999")
        db.add(admin_user)

        # Doctor
        doc_user = User(FullName="Dr. Sarah Jenkins", Email="doctor@healthcare.com", PasswordHash=default_pwd, Role="DOCTOR", Phone="555-1111")
        db.add(doc_user)
        db.commit()
        db.refresh(doc_user)

        doc = Doctor(UserID=doc_user.UserID, OrganizationID=hosp.OrganizationID, Specialty="Cardiology", LicenseNumber="MD-884920", Phone="555-1111")
        db.add(doc)

        # Patient
        patient_user = User(FullName="John Doe", Email="patient@healthcare.com", PasswordHash=default_pwd, Role="PATIENT", Phone="555-2222")
        db.add(patient_user)
        db.commit()
        db.refresh(patient_user)

        pat = Patient(UserID=patient_user.UserID, DateOfBirth="1985-06-15", Gender="Male", Address="742 Evergreen Terrace", EmergencyContact="Jane Doe (555-2223)")
        db.add(pat)

        # Lab User
        lab_user = User(FullName="Tech Lab Manager", Email="lab@healthcare.com", PasswordHash=default_pwd, Role="LAB", Phone="555-3333")
        db.add(lab_user)

        # Pharmacy User
        pharm_user = User(FullName="Pharm. Alex Vance", Email="pharmacy@healthcare.com", PasswordHash=default_pwd, Role="PHARMACY", Phone="555-4444")
        db.add(pharm_user)

        db.commit()
        db.refresh(doc)
        db.refresh(pat)

        # 3. Medicines
        med1 = Medicine(MedicineName="Amoxicillin 500mg", GenericName="Amoxicillin", DosageForm="Capsule", Manufacturer="PharmaCorp")
        med2 = Medicine(MedicineName="Lisinopril 10mg", GenericName="Lisinopril", DosageForm="Tablet", Manufacturer="HeartCare Inc")
        med3 = Medicine(MedicineName="Metformin 850mg", GenericName="Metformin", DosageForm="Tablet", Manufacturer="BioPharma")
        db.add_all([med1, med2, med3])
        db.commit()
        db.refresh(med1)

        # 4. Appointment
        appt = Appointment(PatientID=pat.PatientID, DoctorID=doc.DoctorID, AppointmentDate=datetime.utcnow() + timedelta(days=2), Status="CONFIRMED", Reason="Annual Cardiovascular Checkup")
        db.add(appt)
        db.commit()
        db.refresh(appt)

        # 5. Medical Record & Diagnosis
        record = MedicalRecord(PatientID=pat.PatientID, DoctorID=doc.DoctorID, AppointmentID=appt.AppointmentID, Symptoms="Mild shortness of breath and elevated blood pressure.", ClinicalNotes="Patient presents with BP 135/85. Recommended EKG and blood work.")
        db.add(record)
        db.commit()
        db.refresh(record)

        diag = Diagnosis(RecordID=record.RecordID, ICDCode="I10", Description="Essential (primary) hypertension")
        db.add(diag)

        # 6. Lab Test & Report
        lab_test = LabTest(PatientID=pat.PatientID, DoctorID=doc.DoctorID, OrganizationID=lab_org.OrganizationID, TestName="Lipid Panel & Complete Blood Count", Status="COMPLETED")
        db.add(lab_test)
        db.commit()
        db.refresh(lab_test)

        lab_rep = LabReport(TestID=lab_test.TestID, Results="Total Cholesterol: 195 mg/dL, HDL: 50 mg/dL, LDL: 115 mg/dL. All parameters within target range.", ReportFileURL="/uploads/sample_report.pdf")
        db.add(lab_rep)

        # 7. Prescription & Items
        presc = Prescription(PatientID=pat.PatientID, DoctorID=doc.DoctorID, RecordID=record.RecordID)
        db.add(presc)
        db.commit()
        db.refresh(presc)

        p_item = PrescriptionItem(PrescriptionID=presc.PrescriptionID, MedicineID=med2.MedicineID, Dosage="10mg", Frequency="Once daily", Duration="30 Days", Instructions="Take in the morning with water.")
        db.add(p_item)

        # 8. Medication Order
        order = MedicationOrder(PatientID=pat.PatientID, PharmacyID=pharm.OrganizationID, PrescriptionID=presc.PrescriptionID, Status="PROCESSING")
        db.add(order)

        # 9. Access & Permissions
        access = PatientDoctorAccess(PatientID=pat.PatientID, DoctorID=doc.DoctorID, GrantedAt=datetime.utcnow(), ExpiresAt=datetime.utcnow()+timedelta(days=60), Status="ACTIVE")
        db.add(access)
        db.commit()
        db.refresh(access)

        resources = ["MEDICAL_RECORD", "LAB_REPORT", "PRESCRIPTION", "APPOINTMENT", "DIAGNOSIS"]
        for r in resources:
            perm = PatientAccessPermission(AccessID=access.AccessID, ResourceType=r, CanView=True, CanAdd=True, CanEdit=False)
            db.add(perm)

        perm_req = PermissionRequest(PatientID=pat.PatientID, DoctorID=doc.DoctorID, Status="APPROVED", Reason="Routine care coordination access")
        db.add(perm_req)

        # 10. AI Interactions & Recommendations
        ai_int = AIInteraction(PatientID=pat.PatientID, InteractionType="CHAT", UserQuery="What are normal BP ranges for adults?", AIResponse="For adults, normal blood pressure is generally defined as systolic under 120 mm Hg and diastolic under 80 mm Hg.")
        db.add(ai_int)

        ai_rec = AIRecommendation(PatientID=pat.PatientID, RecordID=record.RecordID, RecommendationType="CARE_COORDINATION", RecommendationText="Schedule follow-up BP re-check in 4 weeks and encourage low-sodium diet.", Status="PENDING")
        db.add(ai_rec)

        # 11. Notification & Audit Log
        notif = Notification(UserID=patient_user.UserID, Title="Welcome to AI Care Platform", Message="Your care coordination portal account is active.", IsRead=False)
        db.add(notif)

        audit = AccessAuditLog(UserID=doc_user.UserID, PatientID=pat.PatientID, ResourceType="MedicalRecord", ResourceID=record.RecordID, Action="VIEW")
        db.add(audit)

        db.commit()
        print("Database seed successfully completed!")
        print("\nDevelopment Login Credentials:")
        print("-----------------------------------------")
        print("ADMIN:     admin@healthcare.com     / password123")
        print("DOCTOR:    doctor@healthcare.com    / password123")
        print("PATIENT:   patient@healthcare.com   / password123")
        print("LAB:       lab@healthcare.com       / password123")
        print("PHARMACY:  pharmacy@healthcare.com  / password123")
        print("-----------------------------------------")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
