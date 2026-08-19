// Social History (29762-2) — Smoking Status only. Reverse of
// cda-to-fhir/sections/social-history.ts — see docs/CCDA_FHIR_MAPPING.md.
//
// Unlike Results/Vital Signs, Smoking Status observations aren't organizer-grouped —
// each becomes its own <entry><observation> directly, one per Observation resource.
import type { Observation } from "../../shared/types.js";
import type { CdaNode } from "../../cda-to-fhir/parser.js";
import { compact } from "../../cda-to-fhir/utils/xml-tree.js";
import { buildObservationEntry } from "./results.js";
import { buildSection, type SectionBuildResult } from "./shared.js";

const SMOKING_STATUS_OBSERVATION = "2.16.840.1.113883.10.20.22.4.78";
const SOCIAL_HISTORY_CATEGORY = "social-history";

export function buildSocialHistorySection(observations: Observation[]): SectionBuildResult {
  const socialHistory = observations.filter((o) =>
    o.category?.some((c) => c.coding?.some((coding) => coding.code === SOCIAL_HISTORY_CATEGORY)),
  );

  const entries = socialHistory
    .map((obs) => {
      const built = buildObservationEntry(obs);
      if (!built) return undefined;
      const node = {
        observation: compact({
          templateId: { "@root": SMOKING_STATUS_OBSERVATION },
          ...built,
        }),
      } as CdaNode;
      return { node, resourceId: obs.id ?? "unknown" };
    })
    .filter((e): e is { node: CdaNode; resourceId: string } => e !== undefined);

  return buildSection(entries, {
    loincSection: "29762-2",
    sectionTitle: "Social History",
    fhirResourceType: "Observation",
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[SocialHistory]/entry/observation",
  });
}
