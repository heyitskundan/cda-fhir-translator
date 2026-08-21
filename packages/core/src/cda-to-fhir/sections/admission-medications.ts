// Admission Medications (42346-7). Entries optional per spec. Tagged with a
// (text-only, no coding system) category so the reverse direction can tell it apart
// from the plain Medications section — see docs/CCDA_FHIR_MAPPING.md.
import type { Reference } from "../../shared/types.js";
import type { CdaNode } from "../parser.js";
import { mapSection, type SectionMapResult } from "./shared.js";
import { buildMedicationFromSubstanceAdministration } from "./medications.js";

const ADMISSION_MEDICATION = "2.16.840.1.113883.10.20.22.4.36";
const ADMISSION_CATEGORY = [{ text: "Admission Medication" }];

export function mapAdmissionMedicationsSection(
  root: CdaNode,
  patientRef: Reference,
): SectionMapResult {
  return mapSection(root, patientRef, {
    loincSection: "42346-7",
    sectionName: "Admission Medications",
    templateRoot: ADMISSION_MEDICATION,
    idPrefix: "medication-admission",
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[AdmissionMedications]/entry/substanceAdministration",
    fhirResourceType: "MedicationStatement",
    build: (sa, id, patient) =>
      buildMedicationFromSubstanceAdministration(sa, id, patient, ADMISSION_CATEGORY),
  });
}
