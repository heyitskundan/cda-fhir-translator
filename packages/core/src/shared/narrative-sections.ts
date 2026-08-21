// The 38 C-CDA 2.1 sections that carry narrative text only — no structured entries are
// mandated by the spec, and real-world documents essentially never populate them with
// machine-readable clinical statements. Mapped generically: section/code, section/title,
// and a flattened section/text go to Composition.section[], not to a discrete FHIR
// resource. See docs/CCDA_FHIR_MAPPING.md.
//
// "Course of Care Section" (2.16.840.1.113883.10.20.22.2.64) is deliberately excluded —
// its LOINC code could not be independently distinguished from Hospital Course Section's
// during research, and this package doesn't ship an OID it can't verify.
export interface NarrativeSectionDef {
  loinc: string;
  name: string;
  templateOid: string;
}

export const NARRATIVE_SECTIONS: readonly NarrativeSectionDef[] = [
  { loinc: "10154-3", name: "Chief Complaint Section", templateOid: "1.3.6.1.4.1.19376.1.5.3.1.1.13.2.1" },
  { loinc: "46239-0", name: "Chief Complaint and Reason for Visit Section", templateOid: "2.16.840.1.113883.10.20.22.2.13" },
  { loinc: "29299-5", name: "Reason for Visit Section", templateOid: "2.16.840.1.113883.10.20.22.2.12" },
  { loinc: "42349-1", name: "Reason for Referral Section", templateOid: "1.3.6.1.4.1.19376.1.5.3.1.3.1" },
  { loinc: "10164-2", name: "History of Present Illness Section", templateOid: "1.3.6.1.4.1.19376.1.5.3.1.3.4" },
  { loinc: "10187-3", name: "Review of Systems Section", templateOid: "1.3.6.1.4.1.19376.1.5.3.1.3.18" },
  { loinc: "61150-9", name: "Subjective Section", templateOid: "2.16.840.1.113883.10.20.21.2.2" },
  { loinc: "61149-1", name: "Objective Section", templateOid: "2.16.840.1.113883.10.20.21.2.1" },
  { loinc: "10210-3", name: "General Status Section", templateOid: "2.16.840.1.113883.10.20.2.5" },
  { loinc: "29545-1", name: "Physical Exam Section", templateOid: "2.16.840.1.113883.10.20.2.10" },
  { loinc: "51848-0", name: "Assessment Section", templateOid: "2.16.840.1.113883.10.20.22.2.8" },
  { loinc: "51847-2", name: "Assessment and Plan Section", templateOid: "2.16.840.1.113883.10.20.22.2.9" },
  { loinc: "69730-0", name: "Instructions Section", templateOid: "2.16.840.1.113883.10.20.22.2.45" },
  { loinc: "61144-2", name: "Nutrition Section", templateOid: "2.16.840.1.113883.10.20.22.2.57" },
  { loinc: "11329-0", name: "Medical (General) History Section", templateOid: "2.16.840.1.113883.10.20.22.2.39" },
  { loinc: "62387-6", name: "Activities Section", templateOid: "2.16.840.1.113883.10.20.21.2.3" },
  { loinc: "46241-6", name: "Admission Diagnosis Section", templateOid: "2.16.840.1.113883.10.20.22.2.43" },
  { loinc: "78375-3", name: "Discharge Diagnosis Section", templateOid: "2.16.840.1.113883.10.20.22.2.24" },
  { loinc: "18841-7", name: "Hospital Consultations Section", templateOid: "2.16.840.1.113883.10.20.22.2.42" },
  { loinc: "8648-8", name: "Hospital Course Section", templateOid: "1.3.6.1.4.1.19376.1.5.3.1.3.5" },
  { loinc: "8653-8", name: "Hospital Discharge Instructions Section", templateOid: "2.16.840.1.113883.10.20.22.2.41" },
  { loinc: "10184-0", name: "Hospital Discharge Physical Section", templateOid: "1.3.6.1.4.1.19376.1.5.3.1.3.26" },
  { loinc: "11493-4", name: "Hospital Discharge Studies Summary Section", templateOid: "2.16.840.1.113883.10.20.22.2.16" },
  { loinc: "59774-0", name: "Anesthesia Section", templateOid: "2.16.840.1.113883.10.20.22.2.25" },
  { loinc: "55109-3", name: "Complications Section", templateOid: "2.16.840.1.113883.10.20.22.2.37" },
  { loinc: "10219-4", name: "Preoperative Diagnosis Section", templateOid: "2.16.840.1.113883.10.20.22.2.34" },
  { loinc: "10218-6", name: "Postoperative Diagnosis Section", templateOid: "2.16.840.1.113883.10.20.22.2.35" },
  { loinc: "59769-0", name: "Postprocedure Diagnosis Section", templateOid: "2.16.840.1.113883.10.20.22.2.36" },
  { loinc: "29554-3", name: "Procedure Description Section", templateOid: "2.16.840.1.113883.10.20.22.2.27" },
  { loinc: "59775-7", name: "Procedure Disposition Section", templateOid: "2.16.840.1.113883.10.20.18.2.12" },
  { loinc: "59770-8", name: "Procedure Estimated Blood Loss Section", templateOid: "2.16.840.1.113883.10.20.18.2.9" },
  { loinc: "59776-5", name: "Procedure Findings Section", templateOid: "2.16.840.1.113883.10.20.22.2.28" },
  { loinc: "59771-6", name: "Procedure Implants Section", templateOid: "2.16.840.1.113883.10.20.22.2.40" },
  { loinc: "59768-2", name: "Procedure Indications Section", templateOid: "2.16.840.1.113883.10.20.22.2.29" },
  { loinc: "59773-2", name: "Procedure Specimens Taken Section", templateOid: "2.16.840.1.113883.10.20.22.2.31" },
  { loinc: "10216-0", name: "Operative Note Fluids Section", templateOid: "2.16.840.1.113883.10.20.7.12" },
  { loinc: "10223-6", name: "Operative Note Surgical Procedure Section", templateOid: "2.16.840.1.113883.10.20.7.14" },
  { loinc: "11537-8", name: "Surgical Drains Section", templateOid: "2.16.840.1.113883.10.20.7.13" },
] as const;
