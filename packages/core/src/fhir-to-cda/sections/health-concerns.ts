// Health Concerns (75310-3). Reverse of cda-to-fhir/sections/health-concerns.ts — see
// docs/CCDA_FHIR_MAPPING.md.
import type { Condition } from "../../shared/types.js";
import type { CdaNode } from "../../cda-to-fhir/parser.js";
import { compact } from "../../cda-to-fhir/utils/xml-tree.js";
import { fhirDateTimeToHl7Timestamp } from "../utils/dates.js";
import { codeableConceptToCdaCode } from "../utils/coding.js";
import { buildSection, type SectionBuildResult } from "./shared.js";

const HEALTH_CONCERN_ACT = "2.16.840.1.113883.10.20.22.4.132";
const HEALTH_CONCERN_CATEGORY = "health-concern";

function buildEntry(condition: Condition): CdaNode | undefined {
  const code = codeableConceptToCdaCode(condition.code);
  if (!code) return undefined;

  return {
    act: compact({
      templateId: { "@root": HEALTH_CONCERN_ACT },
      effectiveTime: condition.onsetDateTime
        ? { low: { "@value": fhirDateTimeToHl7Timestamp(condition.onsetDateTime) } }
        : undefined,
      code,
    }),
  } as CdaNode;
}

export function buildHealthConcernsSection(conditions: Condition[]): SectionBuildResult {
  const matching = conditions.filter((c) =>
    c.category?.some((cat) => cat.coding?.some((coding) => coding.code === HEALTH_CONCERN_CATEGORY)),
  );

  const entries = matching
    .map((c) => {
      const node = buildEntry(c);
      return node ? { node, resourceId: c.id ?? "unknown" } : undefined;
    })
    .filter((e): e is { node: CdaNode; resourceId: string } => e !== undefined);

  return buildSection(entries, {
    loincSection: "75310-3",
    sectionTitle: "Health Concerns",
    fhirResourceType: "Condition",
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[HealthConcerns]/entry/act",
  });
}
