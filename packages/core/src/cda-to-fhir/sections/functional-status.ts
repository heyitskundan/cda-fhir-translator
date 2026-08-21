// Functional Status (47420-5). Mapping (see docs/CCDA_FHIR_MAPPING.md):
//   entry/.../observation[templateId=...22.4.67] -> Observation[category=functional-status]
import type { Reference } from "../../shared/types.js";
import type { CdaNode } from "../parser.js";
import { mapSection, type SectionMapResult } from "./shared.js";
import { mapObservation } from "./results.js";

const FUNCTIONAL_STATUS_OBSERVATION = "2.16.840.1.113883.10.20.22.4.67";
const FUNCTIONAL_STATUS_CATEGORY = {
  system: "http://terminology.hl7.org/CodeSystem/observation-category",
  code: "functional-status",
};

export function mapFunctionalStatusSection(
  root: CdaNode,
  patientRef: Reference,
): SectionMapResult {
  return mapSection(root, patientRef, {
    loincSection: "47420-5",
    sectionName: "Functional Status",
    templateRoot: FUNCTIONAL_STATUS_OBSERVATION,
    idPrefix: "functional-status",
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[FunctionalStatus]/entry/observation",
    fhirResourceType: "Observation",
    build: (obs, id, patient) => mapObservation(obs, id, patient, FUNCTIONAL_STATUS_CATEGORY),
  });
}
