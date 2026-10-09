import { useState, useEffect, useRef } from "react";
import { Search, User, ChevronDown, Check } from "lucide-react";

export default function PatientSelector({
  patients = [],
  value = "",
  onChange,
  placeholder = "Search & select patient by Name or ID...",
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Selected patient object
  const selectedPatient = patients.find(
    (p) => String(p.PatientID) === String(value) || String(p.id) === String(value)
  );

  // Sync display text when value or patients change
  useEffect(() => {
    if (selectedPatient) {
      const name = selectedPatient.user?.FullName || selectedPatient.FullName || `Patient #${selectedPatient.PatientID}`;
      setSearchTerm(`${name} (ID: #${selectedPatient.PatientID})`);
    } else if (!value) {
      setSearchTerm("");
    }
  }, [value, selectedPatient]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        // Reset search term back to selected label if closed without selecting
        if (selectedPatient) {
          const name = selectedPatient.user?.FullName || selectedPatient.FullName || `Patient #${selectedPatient.PatientID}`;
          setSearchTerm(`${name} (ID: #${selectedPatient.PatientID})`);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedPatient]);

  const filteredPatients = patients.filter((p) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;

    // Remove # or "id:" if typed
    const cleanQ = q.replace("#", "").replace("id:", "").trim();

    const patId = String(p.PatientID || p.id || "").toLowerCase();
    const name = (p.user?.FullName || p.FullName || "").toLowerCase();
    const email = (p.user?.Email || p.Email || "").toLowerCase();
    const phone = (p.user?.Phone || p.Phone || p.EmergencyContact || "").toLowerCase();

    return patId.includes(cleanQ) || name.includes(cleanQ) || email.includes(cleanQ) || phone.includes(cleanQ);
  });

  const handleSelect = (patient) => {
    const pId = patient.PatientID || patient.id;
    const name = patient.user?.FullName || patient.FullName || `Patient #${pId}`;
    onChange(String(pId));
    setSearchTerm(`${name} (ID: #${pId})`);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative", width: "100%" }}>
      <div style={{ position: "relative" }}>
        <input
          type="text"
          className="form-input"
          placeholder={placeholder}
          value={searchTerm}
          disabled={disabled}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (!disabled) setIsOpen(true);
          }}
          style={{ paddingRight: "36px", paddingLeft: "36px" }}
        />
        <div style={{
          position: "absolute",
          left: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--primary)",
          pointerEvents: "none"
        }}>
          <Search size={16} />
        </div>
        <div style={{
          position: "absolute",
          right: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--text-muted)",
          pointerEvents: "none"
        }}>
          <ChevronDown size={16} />
        </div>
      </div>

      {isOpen && !disabled && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          left: 0,
          right: 0,
          zIndex: 1100,
          background: "var(--bg-card-solid)",
          backdropFilter: "blur(16px)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-md)",
          boxShadow: "0 10px 28px rgba(0,0,0,0.25)",
          maxHeight: "260px",
          overflowY: "auto",
          padding: "6px"
        }}>
          {filteredPatients.length === 0 ? (
            <div style={{ padding: "12px 16px", fontSize: "13px", color: "var(--text-muted)", textAlign: "center" }}>
              No patient found matching "{searchTerm}" (searched by Name & ID)
            </div>
          ) : (
            filteredPatients.map((p) => {
              const pId = p.PatientID || p.id;
              const isSelected = String(pId) === String(value);
              const name = p.user?.FullName || p.FullName || `Patient #${pId}`;
              const email = p.user?.Email || p.Email;
              const phone = p.user?.Phone || p.Phone || p.EmergencyContact;

              return (
                <div
                  key={pId}
                  onClick={() => handleSelect(p)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: isSelected ? "var(--primary-light)" : "transparent",
                    transition: "background 0.15s ease",
                    marginBottom: "4px"
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = "rgba(99, 102, 241, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      background: "var(--primary-light)",
                      color: "var(--primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "700"
                    }}>
                      <User size={15} />
                    </div>
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "13px", color: "var(--text-primary)" }}>
                        {name} <span style={{ color: "var(--primary)", fontWeight: "700" }}>(ID: #{pId})</span>
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                        {email ? `Email: ${email}` : ""} {email && phone ? "• " : ""} {phone ? `Phone: ${phone}` : ""}
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check size={16} color="var(--primary)" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
