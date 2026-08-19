// Social History (29762-2) — Smoking Status only. Mapping (see docs/CCDA_FHIR_MAPPING.md):
//   entry/observation[templateId=...22.4.78] -> Observation[category=social-history]
//   code                                       -> Observation.code
//   value[@xsi:type=CD]                        -> Observation.valueCodeableConcept
//   effectiveTime/@value or low                -> Observation.effectiveDateTime
import type { Reference } from "../../shared/types.js";
import type { CdaNode } from "../parser.js";
import { mapSection, type SectionMapResult } from "./shared.js";
import { mapObservation } from "./results.js";

const SMOKING_STATUS_OBSERVATION = "2.16.840.1.113883.10.20.22.4.78";
const SOCIAL_HISTORY_CATEGORY = {
  system: "http://terminology.hl7.org/CodeSystem/observation-category",
  code: "social-history",
};

export function mapSocialHistorySection(root: CdaNode, patientRef: Reference): SectionMapResult {
  return mapSection(root, patientRef, {
    loincSection: "29762-2",
    sectionName: "Social History",
    templateRoot: SMOKING_STATUS_OBSERVATION,
    idPrefix: "social-history",
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[SocialHistory]/entry/observation",
    fhirResourceType: "Observation",
    build: (obs, id, patient) => mapObservation(obs, id, patient, SOCIAL_HISTORY_CATEGORY),
  });
}
