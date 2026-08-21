// Medications Administered (29549-3). Reuses Medication Activity's entry template
// (same as the Medications section) — see docs/CCDA_FHIR_MAPPING.md. Tagged
// `category=inpatient` so the reverse direction can tell it apart from the plain
// Medications section.
import type { Reference } from "../../shared/types.js";
import type { CdaNode } from "../parser.js";
import { mapSection, type SectionMapResult } from "./shared.js";
import { buildMedicationFromSubstanceAdministration } from "./medications.js";

const MEDICATION_ACTIVITY = "2.16.840.1.113883.10.20.22.4.16";
const INPATIENT_CATEGORY = [
  {
    coding: [
      {
        system: "http://terminology.hl7.org/CodeSystem/medication-statement-category",
        code: "inpatient",
        display: "Inpatient",
      },
    ],
  },
];

export function mapMedicationsAdministeredSection(
  root: CdaNode,
  patientRef: Reference,
): SectionMapResult {
  return mapSection(root, patientRef, {
    loincSection: "29549-3",
    sectionName: "Medications Administered",
    templateRoot: MEDICATION_ACTIVITY,
    idPrefix: "medication-administered",
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[MedicationsAdministered]/entry/substanceAdministration",
    fhirResourceType: "MedicationStatement",
    build: (sa, id, patient) =>
      buildMedicationFromSubstanceAdministration(sa, id, patient, INPATIENT_CATEGORY),
  });
}
