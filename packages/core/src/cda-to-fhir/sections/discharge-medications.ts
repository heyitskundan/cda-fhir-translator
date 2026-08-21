// Discharge Medications (75311-1). Tagged with a (text-only, no coding system)
// category so the reverse direction can tell it apart from the plain Medications
// section — see docs/CCDA_FHIR_MAPPING.md.
import type { Reference } from "../../shared/types.js";
import type { CdaNode } from "../parser.js";
import { mapSection, type SectionMapResult } from "./shared.js";
import { buildMedicationFromSubstanceAdministration } from "./medications.js";

const DISCHARGE_MEDICATION = "2.16.840.1.113883.10.20.22.4.35";
const DISCHARGE_CATEGORY = [{ text: "Discharge Medication" }];

export function mapDischargeMedicationsSection(
  root: CdaNode,
  patientRef: Reference,
): SectionMapResult {
  return mapSection(root, patientRef, {
    loincSection: "75311-1",
    sectionName: "Discharge Medications",
    templateRoot: DISCHARGE_MEDICATION,
    idPrefix: "medication-discharge",
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[DischargeMedications]/entry/substanceAdministration",
    fhirResourceType: "MedicationStatement",
    build: (sa, id, patient) =>
      buildMedicationFromSubstanceAdministration(sa, id, patient, DISCHARGE_CATEGORY),
  });
}
