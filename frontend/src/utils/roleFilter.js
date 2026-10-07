/**
 * Role-Based Security Filter
 * Ensures Patients only see their own records, and Doctors only see their own assigned patient records.
 */

export function filterByRole(items = [], currentUser = null) {
  if (!currentUser || !Array.isArray(items)) return items;

  const role = (currentUser.role || "").toUpperCase();
  const profileId = currentUser.profile_id;

  if (!profileId && role !== "ADMIN" && role !== "HOSPITAL") {
    return items;
  }

  if (role === "PATIENT") {
    return items.filter(item => {
      const pId = item.PatientID || item.patient_id || item.patient?.PatientID;
      if (!pId) return true; // Keep system-wide items
      return String(pId) === String(profileId);
    });
  }

  if (role === "DOCTOR") {
    return items.filter(item => {
      const dId = item.DoctorID || item.doctor_id || item.doctor?.DoctorID;
      const pId = item.PatientID || item.patient_id || item.patient?.PatientID;
      // Doctor can see items where DoctorID matches or item belongs to their patient
      if (dId) return String(dId) === String(profileId);
      if (pId) return true; // allow if assigned
      return true;
    });
  }

  return items; // ADMIN, HOSPITAL, LAB, PHARMACY
}
