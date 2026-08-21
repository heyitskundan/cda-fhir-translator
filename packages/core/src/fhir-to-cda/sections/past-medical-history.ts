// Past Medical History (11348-0). Reverse of
// cda-to-fhir/sections/past-medical-history.ts — see docs/CCDA_FHIR_MAPPING.md.
import type { Condition } from "../../shared/types.js";
import type { CdaNode } from "../../cda-to-fhir/parser.js";
import { buildEntry } from "./problems.js";
import { buildSection, type SectionBuildResult } from "./shared.js";

const PAST_MEDICAL_HISTORY_CATEGORY_TEXT = "Past Medical History";

export function buildPastMedicalHistorySection(conditions: Condition[]): SectionBuildResult {
  const matching = conditions.filter(
    (c) => c.category?.[0]?.text === PAST_MEDICAL_HISTORY_CATEGORY_TEXT,
  );

  const entries = matching
    .map((c) => {
      const node = buildEntry(c);
      return node ? { node, resourceId: c.id ?? "unknown" } : undefined;
    })
    .filter((e): e is { node: CdaNode; resourceId: string } => e !== undefined);

  return buildSection(entries, {
    loincSection: "11348-0",
    sectionTitle: "Past Medical History",
    fhirResourceType: "Condition",
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[PastMedicalHistory]/entry/act/entryRelationship/observation",
  });
}
