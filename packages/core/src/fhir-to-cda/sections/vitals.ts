// Vital Signs (8716-3). Reverse of cda-to-fhir/sections/vitals.ts — see
// docs/CCDA_FHIR_MAPPING.md.
//
// cda-to-fhir preserves each source organizer as a separate group; that grouping isn't
// carried on the FHIR Observation resources themselves (only `category=vital-signs`
// is), so this direction can't recover the original organizer boundaries. All vital
// sign Observations are grouped into a single organizer entry — coded data round-trips,
// the original grouping doesn't. Documented, not silent.
import type { Observation } from "../../shared/types.js";
import type { CdaNode } from "../../cda-to-fhir/parser.js";
import { compact } from "../../cda-to-fhir/utils/xml-tree.js";
import { RESULT_ORGANIZER } from "../../cda-to-fhir/sections/results.js";
import { buildObservationEntry } from "./results.js";
import { buildSection, type SectionBuildResult } from "./shared.js";

const VITAL_SIGNS_CATEGORY = "vital-signs";

export function buildVitalsSection(observations: Observation[]): SectionBuildResult {
  const vitals = observations.filter((o) =>
    o.category?.some((c) => c.coding?.some((coding) => coding.code === VITAL_SIGNS_CATEGORY)),
  );
  if (vitals.length === 0) return { mappings: [] };

  const components = vitals
    .map(buildObservationEntry)
    .filter((o): o is CdaNode => o !== undefined)
    .map((observation) => ({ observation }));

  const node = {
    organizer: compact({
      templateId: { "@root": RESULT_ORGANIZER },
      code: { "@code": "46680005", "@codeSystem": "2.16.840.1.113883.6.96" },
      component: components,
    }),
  } as CdaNode;

  return buildSection([{ node, resourceId: vitals.map((v) => v.id).join(",") }], {
    loincSection: "8716-3",
    sectionTitle: "Vital Signs",
    fhirResourceType: "Observation",
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[VitalSigns]/entry/organizer",
  });
}
