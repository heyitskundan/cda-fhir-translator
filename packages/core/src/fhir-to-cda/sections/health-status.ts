// Health Status Evaluations and Outcomes (11383-7). Reverse of
// cda-to-fhir/sections/health-status.ts — see docs/CCDA_FHIR_MAPPING.md.
//
// The forward direction reads two different entry templates (Outcome Observation,
// Progress Toward Goal Observation) into this same category; that distinction isn't
// recoverable on a roundtrip — every Observation here is rebuilt as an Outcome
// Observation, the more common of the two.
import type { Observation } from "../../shared/types.js";
import type { CdaNode } from "../../cda-to-fhir/parser.js";
import { compact } from "../../cda-to-fhir/utils/xml-tree.js";
import { buildObservationEntry } from "./results.js";
import { buildSection, type SectionBuildResult } from "./shared.js";

const OUTCOME_OBSERVATION = "2.16.840.1.113883.10.20.22.4.144";
const HEALTH_STATUS_CATEGORY = "health-status";

export function buildHealthStatusSection(observations: Observation[]): SectionBuildResult {
  const matching = observations.filter((o) =>
    o.category?.some((c) => c.coding?.some((coding) => coding.code === HEALTH_STATUS_CATEGORY)),
  );

  const entries = matching
    .map((obs) => {
      const built = buildObservationEntry(obs);
      if (!built) return undefined;
      const node = {
        observation: compact({ templateId: { "@root": OUTCOME_OBSERVATION }, ...built }),
      } as CdaNode;
      return { node, resourceId: obs.id ?? "unknown" };
    })
    .filter((e): e is { node: CdaNode; resourceId: string } => e !== undefined);

  return buildSection(entries, {
    loincSection: "11383-7",
    sectionTitle: "Health Status Evaluations and Outcomes",
    fhirResourceType: "Observation",
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[HealthStatusEvaluationsAndOutcomes]/entry/observation",
  });
}
