// Comprehensive Global Pharmaceutical & World Medicines Catalog
// Covers all WHO Essential Medicines and top global prescription / OTC drugs

export const WORLD_MEDICINES = [
  // --- ANALGESICS & NSAIDS ---
  { id: "wm-1", name: "Paracetamol (Acetaminophen)", genericName: "Acetaminophen / Paracetamol", brandNames: ["Tylenol", "Panadol", "Calpol", "Dolo 650"], category: "Analgesics & Antipyretics", form: "Tablet", defaultDosage: "500mg - 650mg", manufacturer: "GSK / Johnson & Johnson" },
  { id: "wm-2", name: "Ibuprofen", genericName: "Ibuprofen", brandNames: ["Advil", "Motrin", "Nurofen", "Brufen"], category: "NSAIDs & Pain Relief", form: "Tablet", defaultDosage: "400mg", manufacturer: "Pfizer / Reckitt" },
  { id: "wm-3", name: "Aspirin (Acetylsalicylic Acid)", genericName: "Acetylsalicylic Acid", brandNames: ["Bayer Aspirin", "Ecotrin"], category: "NSAIDs & Antiplatelet", form: "Tablet", defaultDosage: "81mg - 325mg", manufacturer: "Bayer" },
  { id: "wm-4", name: "Naproxen", genericName: "Naproxen", brandNames: ["Aleve", "Naprosyn"], category: "NSAIDs", form: "Tablet", defaultDosage: "500mg", manufacturer: "Roche / Bayer" },
  { id: "wm-5", name: "Tramadol Hydrochloride", genericName: "Tramadol", brandNames: ["Ultram", "ConZip"], category: "Opioid Analgesic", form: "Capsule", defaultDosage: "50mg", manufacturer: "Grünenthal" },
  { id: "wm-6", name: "Celecoxib", genericName: "Celecoxib", brandNames: ["Celebrex"], category: "COX-2 Inhibitor / NSAID", form: "Capsule", defaultDosage: "200mg", manufacturer: "Pfizer" },
  { id: "wm-7", name: "Diclofenac Sodium", genericName: "Diclofenac", brandNames: ["Voltarol", "Cataflam", "Voltaren"], category: "NSAIDs", form: "Tablet / Gel", defaultDosage: "50mg", manufacturer: "Novartis" },
  { id: "wm-8", name: "Meloxicam", genericName: "Meloxicam", brandNames: ["Mobic"], category: "NSAIDs", form: "Tablet", defaultDosage: "15mg", manufacturer: "Boehringer Ingelheim" },
  { id: "wm-9", name: "Ketorolac Tromethamine", genericName: "Ketorolac", brandNames: ["Toradol"], category: "NSAIDs (Injectable/Oral)", form: "Injection / Tablet", defaultDosage: "30mg/mL", manufacturer: "Roche" },
  { id: "wm-10", name: "Morphine Sulfate", genericName: "Morphine", brandNames: ["MS Contin", "Kadian"], category: "Opioid Analgesic", form: "Tablet / Injection", defaultDosage: "15mg", manufacturer: "Purdue Pharma" },
  { id: "wm-11", name: "Codeine Phosphate", genericName: "Codeine", brandNames: ["Codeine Continuous"], category: "Opioid Analgesic", form: "Tablet", defaultDosage: "30mg", manufacturer: "Generic" },
  { id: "wm-12", name: "Hydrocodone / Acetaminophen", genericName: "Hydrocodone & Acetaminophen", brandNames: ["Vicodin", "Norco", "Lortab"], category: "Opioid Analgesic", form: "Tablet", defaultDosage: "5mg / 325mg", manufacturer: "AbbVie" },
  { id: "wm-13", name: "Fentanyl", genericName: "Fentanyl", brandNames: ["Duragesic", "Abstral"], category: "Opioid Analgesic", form: "Transdermal Patch", defaultDosage: "25 mcg/hr", manufacturer: "Janssen" },
  { id: "wm-14", name: "Oxycodone Hydrochloride", genericName: "Oxycodone", brandNames: ["OxyContin", "Roxicodone"], category: "Opioid Analgesic", form: "Tablet", defaultDosage: "10mg", manufacturer: "Purdue Pharma" },

  // --- ANTIBIOTICS & ANTIMICROBIALS ---
  { id: "wm-15", name: "Amoxicillin 500mg", genericName: "Amoxicillin", brandNames: ["Amoxil", "Trimox"], category: "Penicillin Antibiotics", form: "Capsule", defaultDosage: "500mg", manufacturer: "GSK / Teva" },
  { id: "wm-16", name: "Amoxicillin / Clavulanate", genericName: "Amoxicillin & Clavulanic Acid", brandNames: ["Augmentin", "Clavam"], category: "Penicillin Antibiotics", form: "Tablet", defaultDosage: "625mg", manufacturer: "GSK" },
  { id: "wm-17", name: "Azithromycin", genericName: "Azithromycin", brandNames: ["Zithromax", "Z-Pak", "Azee"], category: "Macrolide Antibiotics", form: "Tablet", defaultDosage: "500mg", manufacturer: "Pfizer" },
  { id: "wm-18", name: "Ciprofloxacin", genericName: "Ciprofloxacin", brandNames: ["Cipro", "Ciproxin"], category: "Fluoroquinolones", form: "Tablet", defaultDosage: "500mg", manufacturer: "Bayer" },
  { id: "wm-19", name: "Levofloxacin", genericName: "Levofloxacin", brandNames: ["Levaquin"], category: "Fluoroquinolones", form: "Tablet", defaultDosage: "500mg", manufacturer: "Janssen" },
  { id: "wm-20", name: "Ceftriaxone", genericName: "Ceftriaxone Sodium", brandNames: ["Rocephin"], category: "Cephalosporin Antibiotics", form: "Injection", defaultDosage: "1g", manufacturer: "Roche" },
  { id: "wm-21", name: "Cephalexin", genericName: "Cephalexin", brandNames: ["Keflex"], category: "Cephalosporin Antibiotics", form: "Capsule", defaultDosage: "500mg", manufacturer: "Lilly / Teva" },
  { id: "wm-22", name: "Doxycycline Hyclate", genericName: "Doxycycline", brandNames: ["Vibramycin", "Doryx"], category: "Tetracycline Antibiotics", form: "Capsule", defaultDosage: "100mg", manufacturer: "Pfizer" },
  { id: "wm-23", name: "Metronidazole", genericName: "Metronidazole", brandNames: ["Flagyl"], category: "Nitroimidazole Antibiotics", form: "Tablet", defaultDosage: "400mg", manufacturer: "Sanofi" },
  { id: "wm-24", name: "Clindamycin", genericName: "Clindamycin Hydrochloride", brandNames: ["Cleocin", "Dalacin"], category: "Lincosamide Antibiotics", form: "Capsule", defaultDosage: "300mg", manufacturer: "Pfizer" },
  { id: "wm-25", name: "Vancomycin Hydrochloride", genericName: "Vancomycin", brandNames: ["Vancocin"], category: "Glycopeptide Antibiotics", form: "Injection / Capsule", defaultDosage: "1g IV", manufacturer: "MiraXa / ViroPharma" },
  { id: "wm-26", name: "Nitrofurantoin", genericName: "Nitrofurantoin", brandNames: ["Macrobid", "Macrodantin"], category: "Urinary Antiseptic Antibiotic", form: "Capsule", defaultDosage: "100mg", manufacturer: "Procter & Gamble" },
  { id: "wm-27", name: "Sulfamethoxazole / Trimethoprim", genericName: "Trimethoprim & Sulfamethoxazole", brandNames: ["Bactrim DS", "Septra"], category: "Sulfonamides", form: "Tablet", defaultDosage: "800mg / 160mg", manufacturer: "Roche" },
  { id: "wm-28", name: "Fluconazole", genericName: "Fluconazole", brandNames: ["Diflucan", "Forcan"], category: "Antifungals", form: "Tablet", defaultDosage: "150mg", manufacturer: "Pfizer" },
  { id: "wm-29", name: "Acyclovir", genericName: "Acyclovir", brandNames: ["Zovirax"], category: "Antivirals", form: "Tablet", defaultDosage: "400mg", manufacturer: "GSK" },
  { id: "wm-30", name: "Valacyclovir", genericName: "Valacyclovir", brandNames: ["Valtrex"], category: "Antivirals", form: "Tablet", defaultDosage: "500mg", manufacturer: "GSK" },
  { id: "wm-31", name: "Oseltamivir Phosphate", genericName: "Oseltamivir", brandNames: ["Tamiflu"], category: "Antivirals (Influenza)", form: "Capsule", defaultDosage: "75mg", manufacturer: "Genentech / Roche" },
  { id: "wm-32", name: "Remdesivir", genericName: "Remdesivir", brandNames: ["Veklury"], category: "Antivirals (COVID-19)", form: "Injection", defaultDosage: "100mg", manufacturer: "Gilead Sciences" },

  // --- CARDIOVASCULAR & HYPERTENSION ---
  { id: "wm-33", name: "Lisinopril 10mg", genericName: "Lisinopril", brandNames: ["Zestril", "Prinivil"], category: "ACE Inhibitors", form: "Tablet", defaultDosage: "10mg", manufacturer: "AstraZeneca" },
  { id: "wm-34", name: "Enalapril Maleate", genericName: "Enalapril", brandNames: ["Vasotec", "Renitec"], category: "ACE Inhibitors", form: "Tablet", defaultDosage: "5mg", manufacturer: "Merck" },
  { id: "wm-35", name: "Ramipril", genericName: "Ramipril", brandNames: ["Altace", "Tritace"], category: "ACE Inhibitors", form: "Capsule", defaultDosage: "5mg", manufacturer: "Sanofi" },
  { id: "wm-36", name: "Losartan Potassium", genericName: "Losartan", brandNames: ["Cozaar"], category: "ARBs (Angiotensin II Receptor Blockers)", form: "Tablet", defaultDosage: "50mg", manufacturer: "Merck" },
  { id: "wm-37", name: "Valsartan", genericName: "Valsartan", brandNames: ["Diovan"], category: "ARBs", form: "Tablet", defaultDosage: "80mg", manufacturer: "Novartis" },
  { id: "wm-38", name: "Telmisartan", genericName: "Telmisartan", brandNames: ["Micardis", "Telma"], category: "ARBs", form: "Tablet", defaultDosage: "40mg", manufacturer: "Boehringer Ingelheim" },
  { id: "wm-39", name: "Amlodipine Besylate", genericName: "Amlodipine", brandNames: ["Norvasc", "Amlong"], category: "Calcium Channel Blockers", form: "Tablet", defaultDosage: "5mg", manufacturer: "Pfizer" },
  { id: "wm-40", name: "Nifedipine", genericName: "Nifedipine", brandNames: ["Procardia XL", "Adalat"], category: "Calcium Channel Blockers", form: "Tablet", defaultDosage: "30mg", manufacturer: "Bayer" },
  { id: "wm-41", name: "Diltiazem Hydrochloride", genericName: "Diltiazem", brandNames: ["Cardizem", "Tiazac"], category: "Calcium Channel Blockers", form: "Capsule", defaultDosage: "180mg", manufacturer: "Valeant" },
  { id: "wm-42", name: "Verapamil Hydrochloride", genericName: "Verapamil", brandNames: ["Calan", "Isoptin"], category: "Calcium Channel Blockers", form: "Tablet", defaultDosage: "80mg", manufacturer: "Abbott" },
  { id: "wm-43", name: "Metoprolol Succinate", genericName: "Metoprolol", brandNames: ["Toprol XL", "Lopressor"], category: "Beta Blockers", form: "Tablet", defaultDosage: "50mg", manufacturer: "AstraZeneca" },
  { id: "wm-44", name: "Atenolol", genericName: "Atenolol", brandNames: ["Tenormin"], category: "Beta Blockers", form: "Tablet", defaultDosage: "50mg", manufacturer: "AstraZeneca" },
  { id: "wm-45", name: "Carvedilol", genericName: "Carvedilol", brandNames: ["Coreg"], category: "Beta Blockers", form: "Tablet", defaultDosage: "12.5mg", manufacturer: "GSK" },
  { id: "wm-46", name: "Propranolol Hydrochloride", genericName: "Propranolol", brandNames: ["Inderal"], category: "Beta Blockers", form: "Tablet", defaultDosage: "40mg", manufacturer: "Wyeth" },
  { id: "wm-47", name: "Hydrochlorothiazide (HCTZ)", genericName: "Hydrochlorothiazide", brandNames: ["Microzide"], category: "Diuretics (Thiazide)", form: "Tablet", defaultDosage: "25mg", manufacturer: "Generic" },
  { id: "wm-48", name: "Furosemide", genericName: "Furosemide", brandNames: ["Lasix"], category: "Loop Diuretics", form: "Tablet", defaultDosage: "40mg", manufacturer: "Sanofi" },
  { id: "wm-49", name: "Spironolactone", genericName: "Spironolactone", brandNames: ["Aldactone"], category: "Potassium-Sparing Diuretics", form: "Tablet", defaultDosage: "25mg", manufacturer: "Pfizer" },
  { id: "wm-50", name: "Atorvastatin Calcium", genericName: "Atorvastatin", brandNames: ["Lipitor", "Atorva"], category: "Statins / Lipid Lowering", form: "Tablet", defaultDosage: "20mg", manufacturer: "Pfizer" },
  { id: "wm-51", name: "Rosuvastatin Calcium", genericName: "Rosuvastatin", brandNames: ["Crestor", "Rosuvas"], category: "Statins / Lipid Lowering", form: "Tablet", defaultDosage: "10mg", manufacturer: "AstraZeneca" },
  { id: "wm-52", name: "Simvastatin", genericName: "Simvastatin", brandNames: ["Zocor"], category: "Statins", form: "Tablet", defaultDosage: "20mg", manufacturer: "Merck" },
  { id: "wm-53", name: "Clopidogrel Bisulfate", genericName: "Clopidogrel", brandNames: ["Plavix"], category: "Antiplatelet Agents", form: "Tablet", defaultDosage: "75mg", manufacturer: "Sanofi / Bristol-Myers Squibb" },
  { id: "wm-54", name: "Warfarin Sodium", genericName: "Warfarin", brandNames: ["Coumadin", "Jantoven"], category: "Anticoagulants", form: "Tablet", defaultDosage: "5mg", manufacturer: "Bristol-Myers Squibb" },
  { id: "wm-55", name: "Apixaban", genericName: "Apixaban", brandNames: ["Eliquis"], category: "Direct Oral Anticoagulant (DOAC)", form: "Tablet", defaultDosage: "5mg", manufacturer: "BMS / Pfizer" },
  { id: "wm-56", name: "Rivaroxaban", genericName: "Rivaroxaban", brandNames: ["Xarelto"], category: "DOAC / Anticoagulants", form: "Tablet", defaultDosage: "20mg", manufacturer: "Bayer / Janssen" },
  { id: "wm-57", name: "Dabigatran Etexilate", genericName: "Dabigatran", brandNames: ["Pradaxa"], category: "Thrombin Inhibitor Anticoagulant", form: "Capsule", defaultDosage: "150mg", manufacturer: "Boehringer Ingelheim" },
  { id: "wm-58", name: "Nitroglycerin", genericName: "Nitroglycerin", brandNames: ["Nitrostat", "Nitrolingual"], category: "Vasodilators (Angina)", form: "Sublingual Tablet", defaultDosage: "0.4mg", manufacturer: "Pfizer" },
  { id: "wm-59", name: "Digoxin", genericName: "Digoxin", brandNames: ["Lanoxin"], category: "Cardiac Glycosides", form: "Tablet", defaultDosage: "0.25mg", manufacturer: "GSK" },
  { id: "wm-60", name: "Amiodarone Hydrochloride", genericName: "Amiodarone", brandNames: ["Pacerone", "Cordarone"], category: "Antiarrhythmics", form: "Tablet", defaultDosage: "200mg", manufacturer: "Wyeth" },

  // --- ENDOCRINE & DIABETES ---
  { id: "wm-61", name: "Metformin Hydrochloride 850mg", genericName: "Metformin", brandNames: ["Glucophage", "Glycomet"], category: "Biguanides / Anti-Diabetic", form: "Tablet", defaultDosage: "850mg", manufacturer: "Merck / Bristol-Myers Squibb" },
  { id: "wm-62", name: "Glipizide", genericName: "Glipizide", brandNames: ["Glucotrol XL"], category: "Sulfonylureas", form: "Tablet", defaultDosage: "5mg", manufacturer: "Pfizer" },
  { id: "wm-63", name: "Glimepiride", genericName: "Glimepiride", brandNames: ["Amaryl"], category: "Sulfonylureas", form: "Tablet", defaultDosage: "2mg", manufacturer: "Sanofi" },
  { id: "wm-64", name: "Insulin Glargine", genericName: "Insulin Glargine (rDNA)", brandNames: ["Lantus", "Basaglar", "Toujeo"], category: "Long-Acting Insulin", form: "Subcutaneous Injection", defaultDosage: "100 units/mL Pen", manufacturer: "Sanofi / Lilly" },
  { id: "wm-65", name: "Insulin Lispro", genericName: "Insulin Lispro", brandNames: ["Humalog", "Admelog"], category: "Rapid-Acting Insulin", form: "Subcutaneous Injection", defaultDosage: "100 units/mL", manufacturer: "Eli Lilly" },
  { id: "wm-66", name: "Sitagliptin Phosphate", genericName: "Sitagliptin", brandNames: ["Januvia"], category: "DPP-4 Inhibitor", form: "Tablet", defaultDosage: "100mg", manufacturer: "Merck" },
  { id: "wm-67", name: "Empagliflozin", genericName: "Empagliflozin", brandNames: ["Jardiance"], category: "SGLT2 Inhibitor", form: "Tablet", defaultDosage: "10mg", manufacturer: "Boehringer Ingelheim / Lilly" },
  { id: "wm-68", name: "Dapagliflozin", genericName: "Dapagliflozin", brandNames: ["Farxiga", "Forxiga"], category: "SGLT2 Inhibitor", form: "Tablet", defaultDosage: "10mg", manufacturer: "AstraZeneca" },
  { id: "wm-69", name: "Semaglutide Injection / Oral", genericName: "Semaglutide", brandNames: ["Ozempic", "Wegovy", "Rybelsus"], category: "GLP-1 Receptor Agonist", form: "Prefilled Pen / Tablet", defaultDosage: "0.5mg - 1mg Weekly", manufacturer: "Novo Nordisk" },
  { id: "wm-70", name: "Dulaglutide", genericName: "Dulaglutide", brandNames: ["Trulicity"], category: "GLP-1 Receptor Agonist", form: "Prefilled Pen", defaultDosage: "1.5mg Weekly", manufacturer: "Eli Lilly" },
  { id: "wm-71", name: "Tirzepatide", genericName: "Tirzepatide", brandNames: ["Mounjaro", "Zepbound"], category: "GIP & GLP-1 Receptor Agonist", form: "Prefilled Pen", defaultDosage: "5mg Weekly", manufacturer: "Eli Lilly" },
  { id: "wm-72", name: "Levothyroxine Sodium", genericName: "Levothyroxine", brandNames: ["Synthroid", "Levoxyl", "Eltroxin"], category: "Thyroid Hormones", form: "Tablet", defaultDosage: "50mcg - 100mcg", manufacturer: "AbbVie" },
  { id: "wm-73", name: "Methimazole", genericName: "Methimazole", brandNames: ["Tapazole"], category: "Antithyroid Agents", form: "Tablet", defaultDosage: "5mg", manufacturer: "Jones Pharma" },
  { id: "wm-74", name: "Prednisone", genericName: "Prednisone", brandNames: ["Deltasone", "Rayos"], category: "Corticosteroids", form: "Tablet", defaultDosage: "10mg", manufacturer: "Pfizer / Horizon" },
  { id: "wm-75", name: "Dexamethasone", genericName: "Dexamethasone", brandNames: ["Decadron", "DexPak"], category: "Corticosteroids", form: "Tablet / Injection", defaultDosage: "4mg", manufacturer: "Merck" },
  { id: "wm-76", name: "Hydrocortisone", genericName: "Hydrocortisone", brandNames: ["Cortef", "Solu-Cortef"], category: "Corticosteroids", form: "Tablet / Cream", defaultDosage: "20mg", manufacturer: "Pfizer" },

  // --- RESPIRATORY & ALLERGY ---
  { id: "wm-77", name: "Albuterol / Salbutamol Inhaler", genericName: "Salbutamol / Albuterol", brandNames: ["Ventolin HFA", "ProAir HFA", "Asthalin"], category: "Beta-2 Agonist Bronchodilator", form: "Inhaler (MDI)", defaultDosage: "90mcg per puff", manufacturer: "GSK / Teva" },
  { id: "wm-78", name: "Fluticasone Propionate", genericName: "Fluticasone", brandNames: ["Flovent", "Flonase"], category: "Inhaled / Nasal Corticosteroid", form: "Nasal Spray / Inhaler", defaultDosage: "50mcg per spray", manufacturer: "GSK" },
  { id: "wm-79", name: "Budesonide / Formoterol", genericName: "Budesonide & Formoterol", brandNames: ["Symbicort", "Foracort"], category: "ICS & LABA Combination", form: "Inhaler", defaultDosage: "160mcg / 4.5mcg", manufacturer: "AstraZeneca" },
  { id: "wm-80", name: "Fluticasone / Salmeterol", genericName: "Fluticasone & Salmeterol", brandNames: ["Advair Diskus", "Seretide"], category: "ICS & LABA Combination", form: "Inhaler", defaultDosage: "250mcg / 50mcg", manufacturer: "GSK" },
  { id: "wm-81", name: "Tiotropium Bromide", genericName: "Tiotropium", brandNames: ["Spiriva HandiHaler"], category: "Anticholinergic Bronchodilator", form: "Inhalation Powder", defaultDosage: "18mcg", manufacturer: "Boehringer Ingelheim" },
  { id: "wm-82", name: "Montelukast Sodium", genericName: "Montelukast", brandNames: ["Singulair", "Montair"], category: "Leukotriene Receptor Antagonists", form: "Tablet", defaultDosage: "10mg", manufacturer: "Merck" },
  { id: "wm-83", name: "Cetirizine Hydrochloride", genericName: "Cetirizine", brandNames: ["Zyrtec", "Cetzine"], category: "Second-Gen Antihistamines", form: "Tablet", defaultDosage: "10mg", manufacturer: "JCB / Johnson & Johnson" },
  { id: "wm-84", name: "Loratadine", genericName: "Loratadine", brandNames: ["Claritin", "Alavert"], category: "Antihistamines", form: "Tablet", defaultDosage: "10mg", manufacturer: "Bayer" },
  { id: "wm-85", name: "Fexofenadine Hydrochloride", genericName: "Fexofenadine", brandNames: ["Allegra"], category: "Antihistamines", form: "Tablet", defaultDosage: "180mg", manufacturer: "Sanofi" },
  { id: "wm-86", name: "Diphenhydramine Hydrochloride", genericName: "Diphenhydramine", brandNames: ["Benadryl"], category: "First-Gen Antihistamines", form: "Capsule", defaultDosage: "25mg", manufacturer: "McNeil / Kenvue" },

  // --- GASTROINTESTINAL ---
  { id: "wm-87", name: "Omeprazole", genericName: "Omeprazole", brandNames: ["Prilosec", "Omez"], category: "Proton Pump Inhibitors (PPI)", form: "Capsule", defaultDosage: "20mg - 40mg", manufacturer: "AstraZeneca / Dr. Reddy's" },
  { id: "wm-88", name: "Pantoprazole Sodium", genericName: "Pantoprazole", brandNames: ["Protonix", "Pan 40"], category: "Proton Pump Inhibitors (PPI)", form: "Tablet", defaultDosage: "40mg", manufacturer: "Wyeth / Pfizer" },
  { id: "wm-89", name: "Esomeprazole Magnesium", genericName: "Esomeprazole", brandNames: ["Nexium"], category: "Proton Pump Inhibitors (PPI)", form: "Capsule", defaultDosage: "40mg", manufacturer: "AstraZeneca" },
  { id: "wm-90", name: "Famotidine", genericName: "Famotidine", brandNames: ["Pepcid AC"], category: "H2 Receptor Blockers", form: "Tablet", defaultDosage: "20mg", manufacturer: "Johnson & Johnson" },
  { id: "wm-91", name: "Ondansetron Hydrochloride", genericName: "Ondansetron", brandNames: ["Zofran", "Emeset"], category: "5-HT3 Antiemetics", form: "Tablet ODT / Injection", defaultDosage: "4mg - 8mg", manufacturer: "GSK" },
  { id: "wm-92", name: "Metoclopramide Hydrochloride", genericName: "Metoclopramide", brandNames: ["Reglan", "Perinorm"], category: "Prokinetic Antiemetic", form: "Tablet", defaultDosage: "10mg", manufacturer: "A.H. Robins" },
  { id: "wm-93", name: "Loperamide Hydrochloride", genericName: "Loperamide", brandNames: ["Imodium A-D"], category: "Antidiarrheals", form: "Capsule", defaultDosage: "2mg", manufacturer: "J&J / Kenvue" },
  { id: "wm-94", name: "Docusate Sodium", genericName: "Docusate", brandNames: ["Colace"], category: "Stool Softeners", form: "Capsule", defaultDosage: "100mg", manufacturer: "Purdue Pharma" },
  { id: "wm-95", name: "Bismuth Subsalicylate", genericName: "Bismuth Subsalicylate", brandNames: ["Pepto-Bismol"], category: "Antidiarrheal / Antacid", form: "Chewable / Liquid", defaultDosage: "262mg/15mL", manufacturer: "Procter & Gamble" },

  // --- NEUROLOGY, PSYCHIATRY & MENTAL HEALTH ---
  { id: "wm-96", name: "Sertraline Hydrochloride", genericName: "Sertraline", brandNames: ["Zoloft"], category: "SSRI Antidepressant", form: "Tablet", defaultDosage: "50mg - 100mg", manufacturer: "Pfizer" },
  { id: "wm-97", name: "Escitalopram Oxalate", genericName: "Escitalopram", brandNames: ["Lexapro", "Cipralex"], category: "SSRI Antidepressant", form: "Tablet", defaultDosage: "10mg - 20mg", manufacturer: "Allergan / Lundbeck" },
  { id: "wm-98", name: "Fluoxetine Hydrochloride", genericName: "Fluoxetine", brandNames: ["Prozac"], category: "SSRI Antidepressant", form: "Capsule", defaultDosage: "20mg", manufacturer: "Eli Lilly" },
  { id: "wm-99", name: "Duloxetine Hydrochloride", genericName: "Duloxetine", brandNames: ["Cymbalta"], category: "SNRI Antidepressant & Neuropathic Pain", form: "Capsule", defaultDosage: "30mg - 60mg", manufacturer: "Eli Lilly" },
  { id: "wm-100", name: "Venlafaxine Hydrochloride", genericName: "Venlafaxine", brandNames: ["Effexor XR"], category: "SNRI Antidepressant", form: "Capsule ER", defaultDosage: "75mg - 150mg", manufacturer: "Wyeth / Pfizer" },
  { id: "wm-101", name: "Alprazolam", genericName: "Alprazolam", brandNames: ["Xanax", "Alprax"], category: "Benzodiazepine Anxiolytic", form: "Tablet", defaultDosage: "0.5mg - 1mg", manufacturer: "Pfizer" },
  { id: "wm-102", name: "Lorazepam", genericName: "Lorazepam", brandNames: ["Ativan"], category: "Benzodiazepines", form: "Tablet", defaultDosage: "1mg", manufacturer: "Valeant" },
  { id: "wm-103", name: "Diazepam", genericName: "Diazepam", brandNames: ["Valium"], category: "Benzodiazepines", form: "Tablet", defaultDosage: "5mg", manufacturer: "Roche" },
  { id: "wm-104", name: "Clonazepam", genericName: "Clonazepam", brandNames: ["Klonopin", "Rivotril"], category: "Benzodiazepine Anticonvulsant", form: "Tablet", defaultDosage: "0.5mg - 1mg", manufacturer: "Roche" },
  { id: "wm-105", name: "Zolpidem Tartrate", genericName: "Zolpidem", brandNames: ["Ambien", "Stilnoct"], category: "Non-Benzodiazepine Hypnotic (Sedative)", form: "Tablet", defaultDosage: "10mg", manufacturer: "Sanofi" },
  { id: "wm-106", name: "Gabapentin", genericName: "Gabapentin", brandNames: ["Neurontin", "Gabapin"], category: "Anticonvulsant & Neuropathic Pain", form: "Capsule", defaultDosage: "300mg - 600mg", manufacturer: "Pfizer" },
  { id: "wm-107", name: "Pregabalin", genericName: "Pregabalin", brandNames: ["Lyrica"], category: "Anticonvulsant & Neuropathic Pain", form: "Capsule", defaultDosage: "75mg - 150mg", manufacturer: "Pfizer" },
  { id: "wm-108", name: "Levetiracetam", genericName: "Levetiracetam", brandNames: ["Keppra"], category: "Antiepileptic / Anticonvulsant", form: "Tablet", defaultDosage: "500mg", manufacturer: "UCB" },
  { id: "wm-109", name: "Topiramate", genericName: "Topiramate", brandNames: ["Topamax"], category: "Anticonvulsant & Migraine Prophylaxis", form: "Tablet", defaultDosage: "50mg - 100mg", manufacturer: "Janssen" },
  { id: "wm-110", name: "Quetiapine Fumarate", genericName: "Quetiapine", brandNames: ["Seroquel"], category: "Atypical Antipsychotic", form: "Tablet", defaultDosage: "25mg - 100mg", manufacturer: "AstraZeneca" },
  { id: "wm-111", name: "Olanzapine", genericName: "Olanzapine", brandNames: ["Zyprexa"], category: "Atypical Antipsychotic", form: "Tablet", defaultDosage: "10mg", manufacturer: "Eli Lilly" },
  { id: "wm-112", name: "Risperidone", genericName: "Risperidone", brandNames: ["Risperdal"], category: "Atypical Antipsychotic", form: "Tablet", defaultDosage: "2mg", manufacturer: "Janssen" },
  { id: "wm-113", name: "Aripiprazole", genericName: "Aripiprazole", brandNames: ["Abilify"], category: "Atypical Antipsychotic", form: "Tablet", defaultDosage: "10mg", manufacturer: "Otsuka / Bristol-Myers Squibb" },
  { id: "wm-114", name: "Methylphenidate Hydrochloride", genericName: "Methylphenidate", brandNames: ["Ritalin", "Concerta"], category: "CNS Stimulant (ADHD)", form: "Tablet / ER", defaultDosage: "10mg - 20mg", manufacturer: "Novartis / Janssen" },
  { id: "wm-115", name: "Amphetamine / Dextroamphetamine", genericName: "Mixed Amphetamine Salts", brandNames: ["Adderall", "Adderall XR"], category: "CNS Stimulant (ADHD)", form: "Tablet", defaultDosage: "20mg", manufacturer: "Takeda" },
  { id: "wm-116", name: "Donepezil Hydrochloride", genericName: "Donepezil", brandNames: ["Aricept"], category: "Cholinesterase Inhibitor (Alzheimer's)", form: "Tablet", defaultDosage: "10mg", manufacturer: "Eisai / Pfizer" },
  { id: "wm-117", name: "Memantine Hydrochloride", genericName: "Memantine", brandNames: ["Namenda"], category: "NMDA Receptor Antagonist", form: "Tablet", defaultDosage: "10mg", manufacturer: "Forest Laboratories" },
  { id: "wm-118", name: "Sumatriptan Succinate", genericName: "Sumatriptan", brandNames: ["Imitrex"], category: "Triptans (Acute Migraine)", form: "Tablet / Spray", defaultDosage: "50mg", manufacturer: "GSK" },

  // --- VITAMINS, MINERALS & SUPPLEMENTS ---
  { id: "wm-119", name: "Vitamin D3 (Cholecalciferol)", genericName: "Cholecalciferol", brandNames: ["D-Rise", "Calderol"], category: "Vitamins & Nutritional Supplements", form: "Capsule / Softgel", defaultDosage: "1000 IU - 60,000 IU", manufacturer: "Generic / US Pharma" },
  { id: "wm-120", name: "Vitamin B12 (Cyanocobalamin)", genericName: "Cyanocobalamin / Methylcobalamin", brandNames: ["Neurobion", "Nurokind"], category: "Vitamins", form: "Tablet / Injection", defaultDosage: "1000 mcg", manufacturer: "Merck / Mankind" },
  { id: "wm-121", name: "Folic Acid (Vitamin B9)", genericName: "Folic Acid", brandNames: ["Folvite"], category: "Vitamins", form: "Tablet", defaultDosage: "5mg", manufacturer: "Wyeth" },
  { id: "wm-122", name: "Ferrous Sulfate (Iron)", genericName: "Ferrous Sulfate", brandNames: ["Feosol", "Slow FE"], category: "Iron Supplements & Anemia", form: "Tablet", defaultDosage: "325mg (65mg elemental Iron)", manufacturer: "GSK" },
  { id: "wm-123", name: "Calcium Carbonate + Vitamin D3", genericName: "Calcium Carbonate & Cholecalciferol", brandNames: ["Caltrate", "Os-Cal", "Shelcal"], category: "Mineral Supplements", form: "Tablet", defaultDosage: "500mg Calcium / 250 IU D3", manufacturer: "GSK / Cipla" },
  { id: "wm-124", name: "Vitamin C (Ascorbic Acid)", genericName: "Ascorbic Acid", brandNames: ["Celin", "Limcee"], category: "Vitamins", form: "Chewable Tablet", defaultDosage: "500mg", manufacturer: "Abbott" },
  { id: "wm-125", name: "Zinc Gluconate", genericName: "Zinc Gluconate", brandNames: ["Zincvit"], category: "Mineral Supplements", form: "Tablet", defaultDosage: "50mg", manufacturer: "Generic" },
  { id: "wm-126", name: "Magnesium Oxide", genericName: "Magnesium Oxide", brandNames: ["Mag-Ox 400"], category: "Mineral Supplements", form: "Tablet", defaultDosage: "400mg", manufacturer: "Blaine" },
  { id: "wm-127", name: "Omega-3 Fish Oil", genericName: "Omega-3 Fatty Acids (EPA/DHA)", brandNames: ["Lovaza", "Vascepa"], category: "Nutritional & Cardiovascular", form: "Capsule", defaultDosage: "1000mg", manufacturer: "GSK / Amarin" },

  // --- DERMATOLOGICAL & OPHTHALMIC ---
  { id: "wm-128", name: "Hydrocortisone Cream 1%", genericName: "Hydrocortisone Topical", brandNames: ["Cortizone-10"], category: "Topical Steroids", form: "Cream / Ointment", defaultDosage: "Apply 2-3 times daily", manufacturer: "Sanofi" },
  { id: "wm-129", name: "Triamcinolone Acetonide", genericName: "Triamcinolone", brandNames: ["Kenalog"], category: "Topical Steroids", form: "Cream 0.1%", defaultDosage: "Apply thin layer", manufacturer: "Apothecon" },
  { id: "wm-130", name: "Tretinoin Cream", genericName: "Tretinoin", brandNames: ["Retin-A", "A-Ret"], category: "Retinoids (Acne / Anti-aging)", form: "Cream 0.05%", defaultDosage: "Apply once daily at night", manufacturer: "Valeant" },
  { id: "wm-131", name: "Timolol Maleate Ophthalmic", genericName: "Timolol", brandNames: ["Timoptic"], category: "Glaucoma Eye Drops", form: "Eye Drops 0.5%", defaultDosage: "1 drop twice daily", manufacturer: "Merck" },
  { id: "wm-132", name: "Latanoprost Ophthalmic", genericName: "Latanoprost", brandNames: ["Xalatan"], category: "Glaucoma Eye Drops", form: "Eye Drops 0.005%", defaultDosage: "1 drop at bedtime", manufacturer: "Pfizer" },

  // --- ONCOLOGY & IMMUNOLOGY ---
  { id: "wm-133", name: "Methotrexate", genericName: "Methotrexate", brandNames: ["Trexall", "Rheumatrex"], category: "Antimetabolite / Immunosuppressant", form: "Tablet", defaultDosage: "2.5mg - 15mg Weekly", manufacturer: "Teva" },
  { id: "wm-134", name: "Tamoxifen Citrate", genericName: "Tamoxifen", brandNames: ["Nolvadex"], category: "SERM / Oncology (Breast Cancer)", form: "Tablet", defaultDosage: "20mg", manufacturer: "AstraZeneca" },
  { id: "wm-135", name: "Anastrozole", genericName: "Anastrozole", brandNames: ["Arimidex"], category: "Aromatase Inhibitor (Oncology)", form: "Tablet", defaultDosage: "1mg", manufacturer: "AstraZeneca" },
  { id: "wm-136", name: "Hydroxychloroquine Sulfate", genericName: "Hydroxychloroquine", brandNames: ["Plaquenil"], category: "DMARD / Antimalarial", form: "Tablet", defaultDosage: "200mg", manufacturer: "Sanofi" },
  { id: "wm-137", name: "Tacrolimus", genericName: "Tacrolimus", brandNames: ["Prograf"], category: "Immunosuppressant (Transplant)", form: "Capsule", defaultDosage: "1mg", manufacturer: "Astellas" },
  { id: "wm-138", name: "Adalimumab", genericName: "Adalimumab", brandNames: ["Humira"], category: "TNF Inhibitor Biologic", form: "Subcutaneous Injection Pen", defaultDosage: "40mg / 0.8mL", manufacturer: "AbbVie" },
  { id: "wm-139", name: "Pembrolizumab", genericName: "Pembrolizumab", brandNames: ["Keytruda"], category: "Immune Checkpoint Inhibitor", form: "IV Infusion", defaultDosage: "200mg IV", manufacturer: "Merck" }
];

export const MEDICINE_CATEGORIES = [
  "All Categories",
  "Analgesics & Antipyretics",
  "NSAIDs & Pain Relief",
  "Opioid Analgesic",
  "Penicillin Antibiotics",
  "Macrolide Antibiotics",
  "Fluoroquinolones",
  "Cephalosporin Antibiotics",
  "Tetracycline Antibiotics",
  "Antifungals",
  "Antivirals",
  "ACE Inhibitors",
  "ARBs (Angiotensin II Receptor Blockers)",
  "Calcium Channel Blockers",
  "Beta Blockers",
  "Diuretics (Thiazide)",
  "Statins / Lipid Lowering",
  "Antiplatelet Agents",
  "Anticoagulants",
  "Biguanides / Anti-Diabetic",
  "Sulfonylureas",
  "Long-Acting Insulin",
  "Rapid-Acting Insulin",
  "DPP-4 Inhibitor",
  "SGLT2 Inhibitor",
  "GLP-1 Receptor Agonist",
  "Thyroid Hormones",
  "Corticosteroids",
  "Beta-2 Agonist Bronchodilator",
  "Inhaled / Nasal Corticosteroid",
  "Antihistamines",
  "Proton Pump Inhibitors (PPI)",
  "5-HT3 Antiemetics",
  "SSRI Antidepressant",
  "SNRI Antidepressant",
  "Benzodiazepine Anxiolytic",
  "Anticonvulsant & Neuropathic Pain",
  "Atypical Antipsychotic",
  "CNS Stimulant (ADHD)",
  "Vitamins & Nutritional Supplements",
  "Mineral Supplements",
  "Topical Steroids",
  "Glaucoma Eye Drops",
  "Immunosuppressant (Transplant)",
  "Biologics & Oncology"
];

// Helper search function to search world medicines by query or category
export function searchWorldMedicines(query = "", category = "All Categories") {
  const q = query.toLowerCase().trim();
  return WORLD_MEDICINES.filter(med => {
    const matchCategory = category === "All Categories" || med.category === category;
    if (!matchCategory) return false;
    if (!q) return true;

    const nameMatch = med.name.toLowerCase().includes(q);
    const genericMatch = med.genericName.toLowerCase().includes(q);
    const brandMatch = med.brandNames.some(b => b.toLowerCase().includes(q));
    const catMatch = med.category.toLowerCase().includes(q);
    const formMatch = med.form.toLowerCase().includes(q);
    return nameMatch || genericMatch || brandMatch || catMatch || formMatch;
  });
}
