import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db

# Use shared in-memory SQLite database with StaticPool
SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_authentication_flow():
    # 1. Register Patient
    reg_payload = {
        "fullName": "Test Patient",
        "email": "testpatient@example.com",
        "password": "password123",
        "role": "PATIENT"
    }
    res_reg = client.post("/api/auth/register", json=reg_payload)
    assert res_reg.status_code == 200
    token = res_reg.json()["access_token"]
    assert token is not None

    # 2. Login Patient
    login_payload = {
        "email": "testpatient@example.com",
        "password": "password123"
    }
    res_login = client.post("/api/auth/login", json=login_payload)
    assert res_login.status_code == 200
    assert "access_token" in res_login.json()

    # 3. Invalid Login
    res_invalid = client.post("/api/auth/login", json={"email": "testpatient@example.com", "password": "wrongpassword"})
    assert res_invalid.status_code == 401

    # 4. Protected GET /me
    headers = {"Authorization": f"Bearer {token}"}
    res_me = client.get("/api/auth/me", headers=headers)
    assert res_me.status_code == 200
    assert res_me.json()["Email"] == "testpatient@example.com"

def test_patient_and_appointment_workflow():
    # Register Doctor
    doc_res = client.post("/api/auth/register", json={
        "fullName": "Dr. Test Doctor",
        "email": "doctor@example.com",
        "password": "password123",
        "role": "DOCTOR",
        "specialty": "Neurology"
    })
    doc_token = doc_res.json()["access_token"]
    doc_profile_id = doc_res.json()["profile_id"]

    # Register Patient
    pat_res = client.post("/api/auth/register", json={
        "fullName": "Jane Patient",
        "email": "jane@example.com",
        "password": "password123",
        "role": "PATIENT"
    })
    pat_token = pat_res.json()["access_token"]
    pat_profile_id = pat_res.json()["profile_id"]

    headers_pat = {"Authorization": f"Bearer {pat_token}"}
    headers_doc = {"Authorization": f"Bearer {doc_token}"}

    # Update patient profile
    upd_res = client.put(f"/api/patients/{pat_profile_id}", json={"Gender": "Female", "Address": "123 Test St"}, headers=headers_pat)
    assert upd_res.status_code == 200
    assert upd_res.json()["Gender"] == "Female"

    # Create Appointment
    appt_res = client.post("/api/appointments", json={
        "PatientID": pat_profile_id,
        "DoctorID": doc_profile_id,
        "AppointmentDate": "2026-10-15T10:00:00",
        "Reason": "Neurology consultation"
    }, headers=headers_pat)
    assert appt_res.status_code == 200
    appt_id = appt_res.json()["AppointmentID"]

    # Update appointment status
    st_res = client.patch(f"/api/appointments/{appt_id}/status", json={"Status": "CONFIRMED"}, headers=headers_doc)
    assert st_res.status_code == 200
    assert st_res.json()["Status"] == "CONFIRMED"

def test_permission_request_workflow():
    # Register Doctor & Patient
    doc = client.post("/api/auth/register", json={"fullName": "Dr. Alice", "email": "alice@example.com", "password": "pwd", "role": "DOCTOR"}).json()
    pat = client.post("/api/auth/register", json={"fullName": "Bob Patient", "email": "bob@example.com", "password": "pwd", "role": "PATIENT"}).json()

    h_doc = {"Authorization": f"Bearer {doc['access_token']}"}
    h_pat = {"Authorization": f"Bearer {pat['access_token']}"}

    # Doctor requests access
    req_res = client.post("/api/access-requests", json={"PatientID": pat["profile_id"], "Reason": "Cardiology evaluation"}, headers=h_doc)
    assert req_res.status_code == 200
    req_id = req_res.json()["RequestID"]

    # Patient approves request
    appr_res = client.patch(f"/api/access-requests/{req_id}/approve", headers=h_pat)
    assert appr_res.status_code == 200
    assert appr_res.json()["Status"] == "APPROVED"

    # Verify PatientDoctorAccess link created
    access_res = client.get("/api/patient-doctor-access", headers=h_doc)
    assert access_res.status_code == 200
    assert len(access_res.json()) >= 1

def test_ai_interactions_and_doctor_review():
    pat = client.post("/api/auth/register", json={"fullName": "AI Patient", "email": "aipat@example.com", "password": "pwd", "role": "PATIENT"}).json()
    doc = client.post("/api/auth/register", json={"fullName": "Dr. AI Reviewer", "email": "aireview@example.com", "password": "pwd", "role": "DOCTOR"}).json()

    h_pat = {"Authorization": f"Bearer {pat['access_token']}"}
    h_doc = {"Authorization": f"Bearer {doc['access_token']}"}

    # AI Interaction
    ai_res = client.post("/api/ai/interactions", json={"PatientID": pat["profile_id"], "UserQuery": "How to manage high fever?"}, headers=h_pat)
    assert ai_res.status_code == 200
    assert "AIResponse" in ai_res.json()

    # AI Recommendation creation
    rec_res = client.post("/api/ai/recommendations", json={"PatientID": pat["profile_id"], "RecommendationType": "FOLLOW_UP", "RecommendationText": "Drink fluids"}, headers=h_pat)
    assert rec_res.status_code == 200
    rec_id = rec_res.json()["RecommendationID"]

    # Doctor reviews recommendation
    rev_res = client.patch(f"/api/ai/recommendations/{rec_id}/review", headers=h_doc)
    assert rev_res.status_code == 200
    assert rev_res.json()["Status"] == "REVIEWED"
