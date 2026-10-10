import { useState, useEffect, useRef } from "react";
import { MEDICINE_CATEGORIES, searchWorldMedicines } from "../data/worldMedicines";
import { medicineApi } from "../services/api";
import { Search, Pill, Check, Plus, Globe, ChevronDown } from "lucide-react";

export default function MedicineSelector({ value, onChange, onSelectMedicineDetails, placeholder = "Search & select medicine from world catalog..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const dropdownRef = useRef(null);

  const filteredMedicines = searchWorldMedicines(searchTerm, selectedCategory);

  // Sync internal display with passed value
  useEffect(() => {
    if (value) {
      setSearchTerm(value);
    }
  }, [value]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (med) => {
    onChange(med.name);
    if (onSelectMedicineDetails) {
      onSelectMedicineDetails(med);
    }
    setIsOpen(false);
  };

  const handleAddCustom = async () => {
    const nameToAdd = searchTerm.trim();
    if (nameToAdd) {
      try {
        await medicineApi.create({
          MedicineName: nameToAdd,
          GenericName: nameToAdd,
          DosageForm: "Tablet / Capsule",
          Manufacturer: "Custom Prescribed"
        }).catch(() => {});
      } catch {
        // ignore if already exists or fallback
      }

      onChange(nameToAdd);
      if (onSelectMedicineDetails) {
        onSelectMedicineDetails({
          name: nameToAdd,
          genericName: nameToAdd,
          form: "Tablet / Capsule",
          defaultDosage: "As directed by physician",
          manufacturer: "Custom Prescribed"
        });
      }
      setIsOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative", width: "100%" }}>
      <div style={{ position: "relative" }}>
        <input
          type="text"
          className="form-input"
          placeholder={placeholder}
          value={value || searchTerm}
          onChange={(e) => {
            const val = e.target.value;
            setSearchTerm(val);
            onChange(val);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          style={{ paddingRight: "40px" }}
        />
        <div style={{
          position: "absolute",
          right: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          pointerEvents: "none",
          color: "var(--text-muted)"
        }}>
          <Globe size={16} color="var(--primary)" />
          <ChevronDown size={16} />
        </div>
      </div>

      {isOpen && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          left: 0,
          right: 0,
          zIndex: 1000,
          background: "var(--bg-card-solid)",
          backdropFilter: "blur(16px)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-md)",
          boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
          maxHeight: "360px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}>
          
          {/* Header toolbar with Category Filter */}
          <div style={{
            padding: "10px 14px",
            borderBottom: "1px solid var(--border-color)",
            background: "var(--bg-card)",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <Search size={15} color="var(--text-muted)" />
            <select
              className="form-input"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                fontSize: "12px",
                height: "30px",
                padding: "2px 8px",
                background: "var(--bg-card-solid)"
              }}
            >
              {MEDICINE_CATEGORIES.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Medicines List */}
          <div style={{ flex: 1, overflowY: "auto", padding: "6px" }}>
            {filteredMedicines.length === 0 ? (
              <div style={{ padding: "16px", textAlign: "center" }}>
                <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "var(--text-muted)" }}>
                  No exact match in catalog for "{searchTerm}".
                </p>
                <button
                  type="button"
                  onClick={handleAddCustom}
                  className="btn-primary btn-xs"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", margin: "0 auto" }}
                >
                  <Plus size={14} />
                  <span>Add "{searchTerm || "Custom Medicine"}" to Prescription</span>
                </button>
              </div>
            ) : (
              filteredMedicines.map((med) => {
                const isSelected = value === med.name;
                return (
                  <div
                    key={med.id}
                    onClick={() => handleSelect(med)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      background: isSelected ? "var(--primary-light)" : "transparent",
                      transition: "all 0.15s ease",
                      borderBottom: "1px dashed var(--border-color)"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = isSelected ? "var(--primary-light)" : "rgba(99, 102, 241, 0.08)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = isSelected ? "var(--primary-light)" : "transparent"}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <div style={{
                        padding: "6px",
                        borderRadius: "6px",
                        background: "var(--primary-light)",
                        color: "var(--primary)",
                        marginTop: "2px"
                      }}>
                        <Pill size={16} />
                      </div>
                      <div>
                        <div style={{ fontWeight: "600", fontSize: "13px", color: "var(--text-primary)" }}>
                          {med.name}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", gap: "8px", marginTop: "2px" }}>
                          <span><strong>Generic:</strong> {med.genericName}</span>
                          <span>•</span>
                          <span><strong>Form:</strong> {med.form}</span>
                          {med.defaultDosage && (
                            <>
                              <span>•</span>
                              <span><strong>Dosage:</strong> {med.defaultDosage}</span>
                            </>
                          )}
                        </div>
                        <div style={{ fontSize: "10px", color: "var(--primary)", marginTop: "2px" }}>
                          Category: {med.category} | Brands: {med.brandNames.join(", ")}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <Check size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Custom medicine bottom shortcut */}
          <div style={{
            padding: "8px 12px",
            borderTop: "1px solid var(--border-color)",
            background: "var(--bg-card)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "12px"
          }}>
            <span style={{ color: "var(--text-muted)" }}>Can't find it? Type any medicine in the world</span>
            <button
              type="button"
              onClick={handleAddCustom}
              className="btn-secondary btn-xs"
              style={{ fontSize: "11px" }}
            >
              Use Custom Name
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
