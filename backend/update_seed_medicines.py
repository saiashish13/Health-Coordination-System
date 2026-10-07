import sys
import os
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app.database import engine, SessionLocal, Base
from app.models.medicine import Medicine

def seed_world_medicines():
    db = SessionLocal()
    try:
        WORLD_MEDS = [
            {"MedicineName": "Paracetamol (Acetaminophen) 500mg", "GenericName": "Acetaminophen", "DosageForm": "Tablet", "Manufacturer": "GSK / Johnson & Johnson"},
            {"MedicineName": "Ibuprofen 400mg", "GenericName": "Ibuprofen", "DosageForm": "Tablet", "Manufacturer": "Pfizer / Reckitt"},
            {"MedicineName": "Aspirin 325mg", "GenericName": "Acetylsalicylic Acid", "DosageForm": "Tablet", "Manufacturer": "Bayer"},
            {"MedicineName": "Naproxen 500mg", "GenericName": "Naproxen", "DosageForm": "Tablet", "Manufacturer": "Bayer"},
            {"MedicineName": "Tramadol 50mg", "GenericName": "Tramadol Hydrochloride", "DosageForm": "Capsule", "Manufacturer": "Grünenthal"},
            {"MedicineName": "Celecoxib 200mg", "GenericName": "Celecoxib", "DosageForm": "Capsule", "Manufacturer": "Pfizer"},
            {"MedicineName": "Diclofenac 50mg", "GenericName": "Diclofenac Sodium", "DosageForm": "Tablet", "Manufacturer": "Novartis"},
            {"MedicineName": "Amoxicillin 500mg", "GenericName": "Amoxicillin", "DosageForm": "Capsule", "Manufacturer": "GSK / Teva"},
            {"MedicineName": "Augmentin 625mg (Amoxicillin/Clavulanate)", "GenericName": "Amoxicillin & Clavulanic Acid", "DosageForm": "Tablet", "Manufacturer": "GSK"},
            {"MedicineName": "Azithromycin 500mg", "GenericName": "Azithromycin", "DosageForm": "Tablet", "Manufacturer": "Pfizer"},
            {"MedicineName": "Ciprofloxacin 500mg", "GenericName": "Ciprofloxacin", "DosageForm": "Tablet", "Manufacturer": "Bayer"},
            {"MedicineName": "Levofloxacin 500mg", "GenericName": "Levofloxacin", "DosageForm": "Tablet", "Manufacturer": "Janssen"},
            {"MedicineName": "Ceftriaxone 1g Injection", "GenericName": "Ceftriaxone", "DosageForm": "Injection", "Manufacturer": "Roche"},
            {"MedicineName": "Doxycycline 100mg", "GenericName": "Doxycycline Hyclate", "DosageForm": "Capsule", "Manufacturer": "Pfizer"},
            {"MedicineName": "Metronidazole 400mg", "GenericName": "Metronidazole", "DosageForm": "Tablet", "Manufacturer": "Sanofi"},
            {"MedicineName": "Fluconazole 150mg", "GenericName": "Fluconazole", "DosageForm": "Tablet", "Manufacturer": "Pfizer"},
            {"MedicineName": "Acyclovir 400mg", "GenericName": "Acyclovir", "DosageForm": "Tablet", "Manufacturer": "GSK"},
            {"MedicineName": "Tamiflu 75mg (Oseltamivir)", "GenericName": "Oseltamivir Phosphate", "DosageForm": "Capsule", "Manufacturer": "Roche"},
            {"MedicineName": "Lisinopril 10mg", "GenericName": "Lisinopril", "DosageForm": "Tablet", "Manufacturer": "AstraZeneca"},
            {"MedicineName": "Losartan 50mg", "GenericName": "Losartan Potassium", "DosageForm": "Tablet", "Manufacturer": "Merck"},
            {"MedicineName": "Valsartan 80mg", "GenericName": "Valsartan", "DosageForm": "Tablet", "Manufacturer": "Novartis"},
            {"MedicineName": "Amlodipine 5mg", "GenericName": "Amlodipine Besylate", "DosageForm": "Tablet", "Manufacturer": "Pfizer"},
            {"MedicineName": "Metoprolol 50mg", "GenericName": "Metoprolol Succinate", "DosageForm": "Tablet", "Manufacturer": "AstraZeneca"},
            {"MedicineName": "Atenolol 50mg", "GenericName": "Atenolol", "DosageForm": "Tablet", "Manufacturer": "AstraZeneca"},
            {"MedicineName": "Furosemide 40mg (Lasix)", "GenericName": "Furosemide", "DosageForm": "Tablet", "Manufacturer": "Sanofi"},
            {"MedicineName": "Atorvastatin 20mg (Lipitor)", "GenericName": "Atorvastatin Calcium", "DosageForm": "Tablet", "Manufacturer": "Pfizer"},
            {"MedicineName": "Rosuvastatin 10mg (Crestor)", "GenericName": "Rosuvastatin Calcium", "DosageForm": "Tablet", "Manufacturer": "AstraZeneca"},
            {"MedicineName": "Clopidogrel 75mg (Plavix)", "GenericName": "Clopidogrel Bisulfate", "DosageForm": "Tablet", "Manufacturer": "Sanofi"},
            {"MedicineName": "Eliquis 5mg (Apixaban)", "GenericName": "Apixaban", "DosageForm": "Tablet", "Manufacturer": "BMS / Pfizer"},
            {"MedicineName": "Xarelto 20mg (Rivaroxaban)", "GenericName": "Rivaroxaban", "DosageForm": "Tablet", "Manufacturer": "Bayer"},
            {"MedicineName": "Metformin 850mg (Glucophage)", "GenericName": "Metformin Hydrochloride", "DosageForm": "Tablet", "Manufacturer": "Merck"},
            {"MedicineName": "Januvia 100mg (Sitagliptin)", "GenericName": "Sitagliptin Phosphate", "DosageForm": "Tablet", "Manufacturer": "Merck"},
            {"MedicineName": "Jardiance 10mg (Empagliflozin)", "GenericName": "Empagliflozin", "DosageForm": "Tablet", "Manufacturer": "Boehringer Ingelheim"},
            {"MedicineName": "Ozempic 1mg (Semaglutide)", "GenericName": "Semaglutide", "DosageForm": "Prefilled Pen", "Manufacturer": "Novo Nordisk"},
            {"MedicineName": "Synthroid 100mcg (Levothyroxine)", "GenericName": "Levothyroxine Sodium", "DosageForm": "Tablet", "Manufacturer": "AbbVie"},
            {"MedicineName": "Prednisone 10mg", "GenericName": "Prednisone", "DosageForm": "Tablet", "Manufacturer": "Pfizer"},
            {"MedicineName": "Ventolin HFA (Albuterol Inhaler)", "GenericName": "Salbutamol / Albuterol", "DosageForm": "Inhaler", "Manufacturer": "GSK"},
            {"MedicineName": "Symbicort (Budesonide/Formoterol)", "GenericName": "Budesonide & Formoterol", "DosageForm": "Inhaler", "Manufacturer": "AstraZeneca"},
            {"MedicineName": "Singulair 10mg (Montelukast)", "GenericName": "Montelukast Sodium", "DosageForm": "Tablet", "Manufacturer": "Merck"},
            {"MedicineName": "Zyrtec 10mg (Cetirizine)", "GenericName": "Cetirizine Hydrochloride", "DosageForm": "Tablet", "Manufacturer": "J&J"},
            {"MedicineName": "Omeprazole 20mg (Prilosec)", "GenericName": "Omeprazole", "DosageForm": "Capsule", "Manufacturer": "AstraZeneca"},
            {"MedicineName": "Protonix 40mg (Pantoprazole)", "GenericName": "Pantoprazole Sodium", "DosageForm": "Tablet", "Manufacturer": "Pfizer"},
            {"MedicineName": "Zofran 4mg (Ondansetron)", "GenericName": "Ondansetron Hydrochloride", "DosageForm": "Tablet", "Manufacturer": "GSK"},
            {"MedicineName": "Zoloft 50mg (Sertraline)", "GenericName": "Sertraline Hydrochloride", "DosageForm": "Tablet", "Manufacturer": "Pfizer"},
            {"MedicineName": "Lexapro 10mg (Escitalopram)", "GenericName": "Escitalopram Oxalate", "DosageForm": "Tablet", "Manufacturer": "Lundbeck"},
            {"MedicineName": "Xanax 0.5mg (Alprazolam)", "GenericName": "Alprazolam", "DosageForm": "Tablet", "Manufacturer": "Pfizer"},
            {"MedicineName": "Gabapentin 300mg", "GenericName": "Gabapentin", "DosageForm": "Capsule", "Manufacturer": "Pfizer"},
            {"MedicineName": "Lyrica 75mg (Pregabalin)", "GenericName": "Pregabalin", "DosageForm": "Capsule", "Manufacturer": "Pfizer"},
            {"MedicineName": "Vitamin D3 60,000 IU", "GenericName": "Cholecalciferol", "DosageForm": "Capsule", "Manufacturer": "Generic Pharma"},
            {"MedicineName": "Vitamin B12 1000mcg", "GenericName": "Cyanocobalamin", "DosageForm": "Tablet", "Manufacturer": "Merck"},
            {"MedicineName": "Ferrous Sulfate 325mg (Iron)", "GenericName": "Ferrous Sulfate", "DosageForm": "Tablet", "Manufacturer": "GSK"},
            {"MedicineName": "Humira 40mg (Adalimumab)", "GenericName": "Adalimumab", "DosageForm": "Prefilled Pen", "Manufacturer": "AbbVie"}
        ]

        existing = set(m.MedicineName.lower() for m in db.query(Medicine).all())
        to_add = []
        for m in WORLD_MEDS:
            if m["MedicineName"].lower() not in existing:
                to_add.append(Medicine(**m))

        if to_add:
            db.add_all(to_add)
            db.commit()
            print(f"Added {len(to_add)} world medicines to backend database.")
        else:
            print("All world medicines already seeded in backend database.")
    except Exception as e:
        print(f"Error seeding world medicines: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_world_medicines()
