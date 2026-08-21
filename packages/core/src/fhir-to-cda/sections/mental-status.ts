// Mental Status (10190-7). Reverse of cda-to-fhir/sections/mental-status.ts — see
// docs/CCDA_FHIR_MAPPING.md.
import type { Observation } from "../../shared/types.js";
import type { CdaNode } from "../../cda-to-fhir/parser.js";
import { compact } from "../../cda-to-fhir/utils/xml-tree.js";
import { buildObservationEntry } from "./results.js";
import { buildSection, type SectionBuildResult } from "./shared.js";

const MENTAL_STATUS_OBSERVATION = "2.16.840.1.113883.10.20.22.4.74";
const MENTAL_STATUS_CATEGORY = "mental-status";

export function buildMentalStatusSection(observations: Observation[]): SectionBuildResult {
  const matching = observations.filter((o) =>
    o.category?.some((c) => c.coding?.some((coding) => coding.code === MENTAL_STATUS_CATEGORY)),
  );

  const entries = matching
    .map((obs) => {
      const built = buildObservationEntry(obs);
      if (!built) return undefined;
      const node = {
        observation: compact({ templateId: { "@root": MENTAL_STATUS_OBSERVATION }, ...built }),
      } as CdaNode;
      return { node, resourceId: obs.id ?? "unknown" };
    })
    .filter((e): e is { node: CdaNode; resourceId: string } => e !== undefined);

  return buildSection(entries, {
    loincSection: "10190-7",
    sectionTitle: "Mental Status",
    fhirResourceType: "Observation",
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[MentalStatus]/entry/observation",
  });
}
