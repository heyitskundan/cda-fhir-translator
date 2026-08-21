// Mental Status (10190-7). Mapping (see docs/CCDA_FHIR_MAPPING.md):
//   entry/.../observation[templateId=...22.4.74] -> Observation[category=mental-status]
import type { Reference } from "../../shared/types.js";
import type { CdaNode } from "../parser.js";
import { mapSection, type SectionMapResult } from "./shared.js";
import { mapObservation } from "./results.js";

const MENTAL_STATUS_OBSERVATION = "2.16.840.1.113883.10.20.22.4.74";
const MENTAL_STATUS_CATEGORY = {
  system: "http://terminology.hl7.org/CodeSystem/observation-category",
  code: "mental-status",
};

export function mapMentalStatusSection(root: CdaNode, patientRef: Reference): SectionMapResult {
  return mapSection(root, patientRef, {
    loincSection: "10190-7",
    sectionName: "Mental Status",
    templateRoot: MENTAL_STATUS_OBSERVATION,
    idPrefix: "mental-status",
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[MentalStatus]/entry/observation",
    fhirResourceType: "Observation",
    build: (obs, id, patient) => mapObservation(obs, id, patient, MENTAL_STATUS_CATEGORY),
  });
}
