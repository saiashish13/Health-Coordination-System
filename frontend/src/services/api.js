const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Token helpers
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
};

export const getAuthToken = () => {
  return localStorage.getItem("token");
};

export const setUserSession = (user) => {
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    localStorage.removeItem("user");
  }
};

export const getUserSession = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Generic HTTP request helper
async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === "object" && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  } else if (options.body instanceof FormData) {
    delete headers["Content-Type"]; // Let browser set boundary
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  } catch (netErr) {
    throw new Error(`Unable to connect to Healthcare API at ${API_BASE_URL}. Please verify the Python backend is running.`);
  }

  if (response.status === 401) {
    clearSession();
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.detail || data.message || "An API error occurred";
    throw new Error(errorMsg);
  }

  return data;
}

// 1. Auth API
export const authApi = {
  login: (credentials) => request("/auth/login", { method: "POST", body: credentials }),
  register: (userData) => request("/auth/register", { method: "POST", body: userData }),
  googleLogin: (googleData) => request("/auth/google", { method: "POST", body: googleData }),
  getMe: () => request("/auth/me", { method: "GET" }),
  refresh: () => request("/auth/refresh", { method: "POST" }),
  logout: () => {
    clearSession();
    return Promise.resolve({ success: true });
  }
};

// 2. Patient API
export const patientApi = {
  getAll: () => request("/patients", { method: "GET" }),
  getMe: () => request("/patients/me", { method: "GET" }),
  getById: (id) => request(`/patients/${id}`, { method: "GET" }),
  update: (id, data) => request(`/patients/${id}`, { method: "PUT", body: data }),
  getAppointments: (id) => request(`/patients/${id}/appointments`, { method: "GET" }),
  getMedicalRecords: (id) => request(`/patients/${id}/medical-records`, { method: "GET" }),
  getDiagnoses: (id) => request(`/patients/${id}/diagnoses`, { method: "GET" }),
  getLabTests: (id) => request(`/patients/${id}/lab-tests`, { method: "GET" }),
  getLabReports: (id) => request(`/patients/${id}/lab-reports`, { method: "GET" }),
  getPrescriptions: (id) => request(`/patients/${id}/prescriptions`, { method: "GET" }),
  getMedicationOrders: (id) => request(`/patients/${id}/medication-orders`, { method: "GET" }),
  getNotifications: (id) => request(`/patients/${id}/notifications`, { method: "GET" }),
  getAIInteractions: (id) => request(`/patients/${id}/ai-interactions`, { method: "GET" }),
  getAIRecommendations: (id) => request(`/patients/${id}/ai-recommendations`, { method: "GET" }),
};

// 3. Doctor API
export const doctorApi = {
  getAll: () => request("/doctors", { method: "GET" }),
  getMe: () => request("/doctors/me", { method: "GET" }),
  getById: (id) => request(`/doctors/${id}`, { method: "GET" }),
  updateMe: (data) => request("/doctors/me", { method: "PUT", body: data }),
  getAppointments: (id) => request(`/doctors/${id}/appointments`, { method: "GET" }),
  getPatients: (id) => request(`/doctors/${id}/patients`, { method: "GET" }),
  getOrganizations: (id) => request(`/doctors/${id}/organizations`, { method: "GET" }),
};

// 4. Organization API
export const organizationApi = {
  getAll: (type) => request(`/organizations${type ? `?type=${type}` : ""}`, { method: "GET" }),
  getById: (id) => request(`/organizations/${id}`, { method: "GET" }),
  create: (data) => request("/organizations", { method: "POST", body: data }),
  update: (id, data) => request(`/organizations/${id}`, { method: "PUT", body: data }),
};

// 5. Appointment API
export const appointmentApi = {
  getAll: () => request("/appointments", { method: "GET" }),
  getById: (id) => request(`/appointments/${id}`, { method: "GET" }),
  create: (data) => request("/appointments", { method: "POST", body: data }),
  update: (id, data) => request(`/appointments/${id}`, { method: "PUT", body: data }),
  updateStatus: (id, status) => request(`/appointments/${id}/status`, { method: "PATCH", body: { Status: status } }),
  delete: (id) => request(`/appointments/${id}`, { method: "DELETE" }),
};

// 6. Medical Record API
export const medicalRecordApi = {
  getAll: () => request("/medical-records", { method: "GET" }),
  getById: (id) => request(`/medical-records/${id}`, { method: "GET" }),
  create: (data) => request("/medical-records", { method: "POST", body: data }),
  update: (id, data) => request(`/medical-records/${id}`, { method: "PUT", body: data }),
  delete: (id) => request(`/medical-records/${id}`, { method: "DELETE" }),
};

// 7. Diagnosis API
export const diagnosisApi = {
  getAll: () => request("/diagnoses", { method: "GET" }),
  getByRecordId: (recordId) => request(`/medical-records/${recordId}/diagnoses`, { method: "GET" }),
  create: (recordId, data) => request(`/medical-records/${recordId}/diagnoses`, { method: "POST", body: data }),
  update: (id, data) => request(`/diagnoses/${id}`, { method: "PUT", body: data }),
  delete: (id) => request(`/diagnoses/${id}`, { method: "DELETE" }),
};

// 8. Laboratory API
export const labApi = {
  getTests: () => request("/lab-tests", { method: "GET" }),
  getTestById: (id) => request(`/lab-tests/${id}`, { method: "GET" }),
  createTest: (data) => request("/lab-tests", { method: "POST", body: data }),
  updateTestStatus: (id, status) => request(`/lab-tests/${id}/status`, { method: "PATCH", body: { Status: status } }),
  getReports: () => request("/lab-reports", { method: "GET" }),
  getReportById: (id) => request(`/lab-reports/${id}`, { method: "GET" }),
  getReportByTestId: (testId) => request(`/lab-tests/${testId}/report`, { method: "GET" }),
  createReport: (data) => request("/lab-reports", { method: "POST", body: data }),
  uploadReportFile: (reportId, formData) => request(`/lab-reports/${reportId}/file`, { method: "POST", body: formData }),
};

// 9. Medicine API
export const medicineApi = {
  getAll: () => request("/medicines", { method: "GET" }),
  getById: (id) => request(`/medicines/${id}`, { method: "GET" }),
  create: (data) => request("/medicines", { method: "POST", body: data }),
  update: (id, data) => request(`/medicines/${id}`, { method: "PUT", body: data }),
  delete: (id) => request(`/medicines/${id}`, { method: "DELETE" }),
};

// 10. Prescription API
export const prescriptionApi = {
  getAll: () => request("/prescriptions", { method: "GET" }),
  getById: (id) => request(`/prescriptions/${id}`, { method: "GET" }),
  create: (data) => request("/prescriptions", { method: "POST", body: data }),
  addItem: (prescriptionId, itemData) => request(`/prescriptions/${prescriptionId}/items`, { method: "POST", body: itemData }),
  updateItem: (itemId, itemData) => request(`/prescription-items/${itemId}`, { method: "PUT", body: itemData }),
  deleteItem: (itemId) => request(`/prescription-items/${itemId}`, { method: "DELETE" }),
};

// 11. Medication Order API
export const medicationOrderApi = {
  getAll: () => request("/medication-orders", { method: "GET" }),
  getById: (id) => request(`/medication-orders/${id}`, { method: "GET" }),
  create: (data) => request("/medication-orders", { method: "POST", body: data }),
  updateStatus: (id, status) => request(`/medication-orders/${id}/status`, { method: "PATCH", body: { Status: status } }),
};

// 12. Permission API
export const permissionApi = {
  createRequest: (data) => request("/access-requests", { method: "POST", body: data }),
  getRequests: () => request("/access-requests", { method: "GET" }),
  getRequestById: (id) => request(`/access-requests/${id}`, { method: "GET" }),
  approveRequest: (id) => request(`/access-requests/${id}/approve`, { method: "PATCH" }),
  rejectRequest: (id) => request(`/access-requests/${id}/reject`, { method: "PATCH" }),
  revokeRequest: (id) => request(`/access-requests/${id}/revoke`, { method: "PATCH" }),
  getDoctorAccessLinks: () => request("/patient-doctor-access", { method: "GET" }),
  getAccessPermissions: () => request("/access-permissions", { method: "GET" }),
};

// 13. Notification API
export const notificationApi = {
  getAll: () => request("/notifications", { method: "GET" }),
  getUnread: () => request("/notifications/unread", { method: "GET" }),
  markAsRead: (id) => request(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () => request("/notifications/read-all", { method: "PATCH" }),
};

// 14. AI API
export const aiApi = {
  createInteraction: (queryData) => request("/ai/interactions", { method: "POST", body: queryData }),
  getInteractions: () => request("/ai/interactions", { method: "GET" }),
  getRecommendations: () => request("/ai/recommendations", { method: "GET" }),
  createRecommendation: (recData) => request("/ai/recommendations", { method: "POST", body: recData }),
  reviewRecommendation: (id) => request(`/ai/recommendations/${id}/review`, { method: "PATCH" }),
  rejectRecommendation: (id) => request(`/ai/recommendations/${id}/reject`, { method: "PATCH" }),
};

// 15. Dashboard API
export const dashboardApi = {
  getPatient: () => request("/dashboards/patient", { method: "GET" }),
  getDoctor: () => request("/dashboards/doctor", { method: "GET" }),
  getHospital: () => request("/dashboards/hospital", { method: "GET" }),
  getLaboratory: () => request("/dashboards/laboratory", { method: "GET" }),
  getPharmacy: () => request("/dashboards/pharmacy", { method: "GET" }),
};

// 16. Admin API
export const adminApi = {
  getUsers: () => request("/admin/users", { method: "GET" }),
  getDoctors: () => request("/admin/doctors", { method: "GET" }),
  getPatients: () => request("/admin/patients", { method: "GET" }),
  getOrganizations: () => request("/admin/organizations", { method: "GET" }),
  getAppointments: () => request("/admin/appointments", { method: "GET" }),
  getAuditLogs: () => request("/admin/audit-logs", { method: "GET" }),
  getStats: () => request("/admin/statistics", { method: "GET" }),
  updateUserRole: (userId, role) => request(`/admin/users/${userId}/role?role=${role}`, { method: "PATCH" }),
};
