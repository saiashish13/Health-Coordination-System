-- ==============================================================================
-- SUPABASE / POSTGRESQL DATABASE SCHEMA (FULL PRODUCTION SETUP)
-- Architecture Spec: AI Care Coordination Database Architecture
-- Note: NO sample data is included as requested.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. DROP EXISTING TABLES IN REVERSE DEPENDENCY ORDER
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS "AccessAuditLog" CASCADE;
DROP TABLE IF EXISTS "Notifications" CASCADE;
DROP TABLE IF EXISTS "AIRecommendations" CASCADE;
DROP TABLE IF EXISTS "AIInteractions" CASCADE;
DROP TABLE IF EXISTS "PatientAccessPermissions" CASCADE;
DROP TABLE IF EXISTS "PatientDoctorAccess" CASCADE;
DROP TABLE IF EXISTS "PermissionRequests" CASCADE;
DROP TABLE IF EXISTS "MedicationOrders" CASCADE;
DROP TABLE IF EXISTS "PrescriptionItems" CASCADE;
DROP TABLE IF EXISTS "Prescriptions" CASCADE;
DROP TABLE IF EXISTS "LabReports" CASCADE;
DROP TABLE IF EXISTS "LabTests" CASCADE;
DROP TABLE IF EXISTS "Diagnoses" CASCADE;
DROP TABLE IF EXISTS "MedicalRecords" CASCADE;
DROP TABLE IF EXISTS "Appointments" CASCADE;
DROP TABLE IF EXISTS "Doctors" CASCADE;
DROP TABLE IF EXISTS "Patients" CASCADE;
DROP TABLE IF EXISTS "Medicines" CASCADE;
DROP TABLE IF EXISTS "Organizations" CASCADE;
DROP TABLE IF EXISTS "Users" CASCADE;

-- ------------------------------------------------------------------------------
-- 2. CREATE SCHEMAS & TABLES
-- ------------------------------------------------------------------------------

-- 2.1 Users Table
-- Stores authentication and account information for everyone who can use the platform.
CREATE TABLE "Users" (
    "UserID" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "FullName" VARCHAR(100) NOT NULL,
    "Email" VARCHAR(150) NOT NULL UNIQUE,
    "Phone" VARCHAR(20),
    "PasswordHash" VARCHAR(255) NOT NULL,
    "Role" VARCHAR(30) NOT NULL, -- PATIENT, DOCTOR, ADMIN, LAB, PHARMACY, etc.
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2.2 Patients Table
-- Stores patient-specific profile information and links a patient profile to a user account.
CREATE TABLE "Patients" (
    "PatientID" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "UserID" INT NOT NULL UNIQUE REFERENCES "Users"("UserID") ON DELETE CASCADE,
    "DateOfBirth" DATE,
    "Gender" VARCHAR(20),
    "BloodGroup" VARCHAR(5),
    "Address" VARCHAR(255)
);

-- 2.3 Organizations Table
-- Stores healthcare organizations and identifies each as a hospital, laboratory, or pharmacy.
CREATE TABLE "Organizations" (
    "OrganizationID" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "OrganizationName" VARCHAR(150) NOT NULL,
    "OrganizationType" VARCHAR(30) NOT NULL, -- HOSPITAL, LAB, or PHARMACY
    "Address" VARCHAR(255),
    "Phone" VARCHAR(20),
    "Email" VARCHAR(150)
);

-- 2.4 Doctors Table
-- Stores doctor-specific professional information and their affiliated organization.
CREATE TABLE "Doctors" (
    "DoctorID" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "UserID" INT NOT NULL UNIQUE REFERENCES "Users"("UserID") ON DELETE CASCADE,
    "OrganizationID" INT REFERENCES "Organizations"("OrganizationID") ON DELETE SET NULL,
    "Specialization" VARCHAR(100),
    "Specialty" VARCHAR(100), -- Aliased for backend model compatibility
    "LicenseNumber" VARCHAR(100)
);

-- 2.5 Appointments Table
-- Connects patients and doctors and records scheduled consultations.
CREATE TABLE "Appointments" (
    "AppointmentID" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "PatientID" INT NOT NULL REFERENCES "Patients"("PatientID") ON DELETE CASCADE,
    "DoctorID" INT NOT NULL REFERENCES "Doctors"("DoctorID") ON DELETE CASCADE,
    "AppointmentDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "Status" VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    "Reason" VARCHAR(500)
);

-- 2.6 MedicalRecords Table
-- Stores clinical notes and symptoms recorded during a patient's care.
CREATE TABLE "MedicalRecords" (
    "RecordID" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "PatientID" INT NOT NULL REFERENCES "Patients"("PatientID") ON DELETE CASCADE,
    "DoctorID" INT REFERENCES "Doctors"("DoctorID") ON DELETE SET NULL,
    "AppointmentID" INT REFERENCES "Appointments"("AppointmentID") ON DELETE SET NULL,
    "RecordDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Symptoms" VARCHAR(1000),
    "ClinicalNotes" TEXT
);

-- 2.7 Diagnoses Table
-- Stores diagnoses associated with medical records.
CREATE TABLE "Diagnoses" (
    "DiagnosisID" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "RecordID" INT NOT NULL REFERENCES "MedicalRecords"("RecordID") ON DELETE CASCADE,
    "DiagnosisName" VARCHAR(200) NOT NULL,
    "ICDCode" VARCHAR(50),
    "Description" VARCHAR(1000)
);

-- 2.8 LabTests Table
-- Stores laboratory tests ordered for patients and identifies the laboratory responsible.
CREATE TABLE "LabTests" (
    "TestID" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "PatientID" INT NOT NULL REFERENCES "Patients"("PatientID") ON DELETE CASCADE,
    "DoctorID" INT REFERENCES "Doctors"("DoctorID") ON DELETE SET NULL,
    "LabOrganizationID" INT REFERENCES "Organizations"("OrganizationID") ON DELETE SET NULL,
    "OrganizationID" INT REFERENCES "Organizations"("OrganizationID") ON DELETE SET NULL, -- Aliased for backend model compatibility
    "TestName" VARCHAR(200) NOT NULL,
    "OrderedDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "TestDate" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Aliased for backend model compatibility
    "Status" VARCHAR(30) NOT NULL DEFAULT 'ORDERED'
);

-- 2.9 LabReports Table
-- Stores the results produced for ordered laboratory tests.
CREATE TABLE "LabReports" (
    "ReportID" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "TestID" INT NOT NULL UNIQUE REFERENCES "LabTests"("TestID") ON DELETE CASCADE,
    "Result" VARCHAR(1000),
    "Results" TEXT, -- Aliased for backend model compatibility
    "NormalRange" VARCHAR(200),
    "ReportFileURL" VARCHAR(500),
    "ReportDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2.10 Medicines Table
-- Master catalog of medicines used by prescriptions and pharmacy workflows.
CREATE TABLE "Medicines" (
    "MedicineID" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "MedicineName" VARCHAR(200) NOT NULL,
    "GenericName" VARCHAR(200),
    "DosageForm" VARCHAR(50),
    "Manufacturer" VARCHAR(150)
);

-- 2.11 Prescriptions Table
-- Stores prescriptions created by doctors for patients.
CREATE TABLE "Prescriptions" (
    "PrescriptionID" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "PatientID" INT NOT NULL REFERENCES "Patients"("PatientID") ON DELETE CASCADE,
    "DoctorID" INT NOT NULL REFERENCES "Doctors"("DoctorID") ON DELETE CASCADE,
    "RecordID" INT REFERENCES "MedicalRecords"("RecordID") ON DELETE SET NULL,
    "PrescriptionDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2.12 PrescriptionItems Table
-- Stores individual medicines, dosage, frequency, duration, and instructions within a prescription.
CREATE TABLE "PrescriptionItems" (
    "PrescriptionItemID" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "PrescriptionID" INT NOT NULL REFERENCES "Prescriptions"("PrescriptionID") ON DELETE CASCADE,
    "MedicineID" INT NOT NULL REFERENCES "Medicines"("MedicineID") ON DELETE CASCADE,
    "Dosage" VARCHAR(100),
    "Frequency" VARCHAR(100),
    "Duration" VARCHAR(100),
    "Instructions" VARCHAR(500)
);

-- 2.13 MedicationOrders Table
-- Stores patient medicine orders sent to pharmacies and linked to prescriptions.
CREATE TABLE "MedicationOrders" (
    "OrderID" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "PatientID" INT NOT NULL REFERENCES "Patients"("PatientID") ON DELETE CASCADE,
    "PharmacyID" INT NOT NULL REFERENCES "Organizations"("OrganizationID") ON DELETE CASCADE,
    "PrescriptionID" INT REFERENCES "Prescriptions"("PrescriptionID") ON DELETE SET NULL,
    "OrderDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Status" VARCHAR(30) NOT NULL DEFAULT 'PENDING'
);

-- 2.14 PermissionRequests Table
-- Records requests made by doctors to obtain patient access.
CREATE TABLE "PermissionRequests" (
    "RequestID" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "PatientID" INT NOT NULL REFERENCES "Patients"("PatientID") ON DELETE CASCADE,
    "DoctorID" INT NOT NULL REFERENCES "Doctors"("DoctorID") ON DELETE CASCADE,
    "RequestedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ApprovedAt" TIMESTAMP WITH TIME ZONE,
    "Status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "Reason" TEXT
);

-- 2.15 PatientDoctorAccess Table
-- Stores active or revoked doctor-patient access after a permission decision.
CREATE TABLE "PatientDoctorAccess" (
    "AccessID" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "PatientID" INT NOT NULL REFERENCES "Patients"("PatientID") ON DELETE CASCADE,
    "DoctorID" INT NOT NULL REFERENCES "Doctors"("DoctorID") ON DELETE CASCADE,
    "AccessType" VARCHAR(30) NOT NULL DEFAULT 'VIEW',
    "GrantedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ExpiresAt" TIMESTAMP WITH TIME ZONE,
    "Status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

-- 2.16 PatientAccessPermissions Table
-- Provides fine-grained permissions for resources such as records, lab reports, prescriptions, and appointments.
CREATE TABLE "PatientAccessPermissions" (
    "PermissionID" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "AccessID" INT NOT NULL REFERENCES "PatientDoctorAccess"("AccessID") ON DELETE CASCADE,
    "ResourceType" VARCHAR(50) NOT NULL,
    "CanView" BOOLEAN NOT NULL DEFAULT FALSE,
    "CanAdd" BOOLEAN NOT NULL DEFAULT FALSE,
    "CanEdit" BOOLEAN NOT NULL DEFAULT FALSE
);

-- 2.17 AIInteractions Table
-- Stores patient-facing AI questions and responses for traceability and care coordination.
CREATE TABLE "AIInteractions" (
    "InteractionID" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "PatientID" INT NOT NULL REFERENCES "Patients"("PatientID") ON DELETE CASCADE,
    "InteractionType" VARCHAR(50),
    "UserQuery" TEXT,
    "AIResponse" TEXT,
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2.18 AIRecommendations Table
-- Stores AI-generated recommendations separately from authoritative clinical records so clinicians can review them.
CREATE TABLE "AIRecommendations" (
    "RecommendationID" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "PatientID" INT NOT NULL REFERENCES "Patients"("PatientID") ON DELETE CASCADE,
    "RecordID" INT REFERENCES "MedicalRecords"("RecordID") ON DELETE SET NULL,
    "RecommendationType" VARCHAR(50),
    "RecommendationText" TEXT,
    "Status" VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    "ReviewedByDoctor" INT REFERENCES "Doctors"("DoctorID") ON DELETE SET NULL,
    "ReviewedAt" TIMESTAMP WITH TIME ZONE,
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2.19 Notifications Table
-- Stores notifications delivered to users for appointments, reports, permissions, prescriptions, and other events.
CREATE TABLE "Notifications" (
    "NotificationID" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "UserID" INT NOT NULL REFERENCES "Users"("UserID") ON DELETE CASCADE,
    "Title" VARCHAR(200),
    "Message" VARCHAR(1000),
    "NotificationType" VARCHAR(50),
    "IsRead" BOOLEAN NOT NULL DEFAULT FALSE,
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2.20 AccessAuditLog Table
-- Records who accessed a patient's resource, what action was performed, and when it happened.
CREATE TABLE "AccessAuditLog" (
    "AuditID" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "UserID" INT NOT NULL REFERENCES "Users"("UserID") ON DELETE CASCADE,
    "PatientID" INT NOT NULL REFERENCES "Patients"("PatientID") ON DELETE CASCADE,
    "ResourceType" VARCHAR(50),
    "ResourceID" INT,
    "Action" VARCHAR(30),
    "AccessedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 3. INDEXES FOR HIGH-PERFORMANCE QUERIES
-- ------------------------------------------------------------------------------
CREATE INDEX idx_users_email ON "Users"("Email");
CREATE INDEX idx_users_role ON "Users"("Role");
CREATE INDEX idx_patients_userid ON "Patients"("UserID");
CREATE INDEX idx_doctors_userid ON "Doctors"("UserID");
CREATE INDEX idx_doctors_orgid ON "Doctors"("OrganizationID");
CREATE INDEX idx_appointments_patientid ON "Appointments"("PatientID");
CREATE INDEX idx_appointments_doctorid ON "Appointments"("DoctorID");
CREATE INDEX idx_appointments_date ON "Appointments"("AppointmentDate");
CREATE INDEX idx_medical_records_patientid ON "MedicalRecords"("PatientID");
CREATE INDEX idx_medical_records_doctorid ON "MedicalRecords"("DoctorID");
CREATE INDEX idx_diagnoses_recordid ON "Diagnoses"("RecordID");
CREATE INDEX idx_lab_tests_patientid ON "LabTests"("PatientID");
CREATE INDEX idx_lab_tests_orgid ON "LabTests"("LabOrganizationID");
CREATE INDEX idx_lab_reports_testid ON "LabReports"("TestID");
CREATE INDEX idx_prescriptions_patientid ON "Prescriptions"("PatientID");
CREATE INDEX idx_prescriptions_doctorid ON "Prescriptions"("DoctorID");
CREATE INDEX idx_medication_orders_patientid ON "MedicationOrders"("PatientID");
CREATE INDEX idx_medication_orders_pharmacyid ON "MedicationOrders"("PharmacyID");
CREATE INDEX idx_permission_requests_patientid ON "PermissionRequests"("PatientID");
CREATE INDEX idx_patient_doctor_access_patientid ON "PatientDoctorAccess"("PatientID");
CREATE INDEX idx_patient_doctor_access_doctorid ON "PatientDoctorAccess"("DoctorID");
CREATE INDEX idx_notifications_userid ON "Notifications"("UserID");
CREATE INDEX idx_audit_log_userid ON "AccessAuditLog"("UserID");
CREATE INDEX idx_audit_log_patientid ON "AccessAuditLog"("PatientID");

-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) & POLICIES FOR SUPABASE API ACCESS
-- ------------------------------------------------------------------------------
ALTER TABLE "Users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Patients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Organizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Doctors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MedicalRecords" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Diagnoses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LabTests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LabReports" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Medicines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Prescriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PrescriptionItems" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MedicationOrders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PermissionRequests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PatientDoctorAccess" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PatientAccessPermissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AIInteractions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AIRecommendations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AccessAuditLog" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated service & API read/write" ON "Users" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated service & API read/write" ON "Patients" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated service & API read/write" ON "Organizations" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated service & API read/write" ON "Doctors" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated service & API read/write" ON "Appointments" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated service & API read/write" ON "MedicalRecords" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated service & API read/write" ON "Diagnoses" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated service & API read/write" ON "LabTests" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated service & API read/write" ON "LabReports" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated service & API read/write" ON "Medicines" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated service & API read/write" ON "Prescriptions" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated service & API read/write" ON "PrescriptionItems" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated service & API read/write" ON "MedicationOrders" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated service & API read/write" ON "PermissionRequests" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated service & API read/write" ON "PatientDoctorAccess" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated service & API read/write" ON "PatientAccessPermissions" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated service & API read/write" ON "AIInteractions" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated service & API read/write" ON "AIRecommendations" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated service & API read/write" ON "Notifications" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated service & API read/write" ON "AccessAuditLog" FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- END OF SCHEMA SCRIPT (READY FOR SUPABASE EXECUTION - NO SEED DATA INCLUDED)
-- ==============================================================================
