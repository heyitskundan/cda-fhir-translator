// Health Status Evaluations and Outcomes (11383-7). Mapping (see
// docs/CCDA_FHIR_MAPPING.md):
//   entry/observation[templateId=...22.4.144] (Outcome Observation)              -> Observation
//   entry/observation[templateId=...22.4.110] (Progress Toward Goal Observation) -> Observation
// Two independent entry templates share one section, so this doesn't use the
// one-template `mapSection` call directly — it runs it twice and merges the results.
import type { Reference } from "../../shared/types.js";
import type { CdaNode } from "../parser.js";
import { mapSection, type SectionMapResult } from "./shared.js";
import { mapObservation } from "./results.js";

const OUTCOME_OBSERVATION = "2.16.840.1.113883.10.20.22.4.144";
const PROGRESS_TOWARD_GOAL_OBSERVATION = "2.16.840.1.113883.10.20.22.4.110";
const HEALTH_STATUS_CATEGORY = {
  system: "http://terminology.hl7.org/CodeSystem/observation-category",
  code: "health-status",
};

function mapByTemplate(
  root: CdaNode,
  patientRef: Reference,
  templateRoot: string,
  idPrefix: string,
): SectionMapResult {
  return mapSection(root, patientRef, {
    loincSection: "11383-7",
    sectionName: "Health Status Evaluations and Outcomes",
    templateRoot,
    idPrefix,
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[HealthStatusEvaluationsAndOutcomes]/entry/observation",
    fhirResourceType: "Observation",
    build: (obs, id, patient) => mapObservation(obs, id, patient, HEALTH_STATUS_CATEGORY),
  });
}

export function mapHealthStatusSection(root: CdaNode, patientRef: Reference): SectionMapResult {
  const outcomes = mapByTemplate(root, patientRef, OUTCOME_OBSERVATION, "health-status-outcome");
  const progress = mapByTemplate(
    root,
    patientRef,
    PROGRESS_TOWARD_GOAL_OBSERVATION,
    "health-status-progress",
  );

  const resources = [...outcomes.resources, ...progress.resources];
  // Each sub-search warns independently if its own template found nothing; only
  // surface that when NEITHER template matched, so using just one of the two doesn't
  // produce a spurious "no entries found" for the other.
  const warnings = resources.length === 0 ? [...outcomes.warnings, ...progress.warnings] : [];

  return {
    resources,
    mappings: [...outcomes.mappings, ...progress.mappings],
    warnings,
  };
}
