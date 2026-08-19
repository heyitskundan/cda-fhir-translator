// Problems (11450-4). Reverse of cda-to-fhir/sections/problems.ts — see
// docs/CCDA_FHIR_MAPPING.md.
import type { Condition } from "../../shared/types.js";
import type { CdaNode } from "../../cda-to-fhir/parser.js";
import { compact } from "../../cda-to-fhir/utils/xml-tree.js";
import { fhirDateTimeToHl7Timestamp } from "../utils/dates.js";
import { codeableConceptToCdaCode } from "../utils/coding.js";
import { buildSection, type SectionBuildResult } from "./shared.js";

const PROBLEM_OBSERVATION = "2.16.840.1.113883.10.20.22.4.4";

function buildEntry(condition: Condition): CdaNode | undefined {
  const code = codeableConceptToCdaCode(condition.code);
  if (!code) return undefined;

  return {
    act: {
      entryRelationship: {
        "@typeCode": "SUBJ",
        observation: compact({
          templateId: { "@root": PROBLEM_OBSERVATION },
          effectiveTime: compact({
            low: condition.onsetDateTime
              ? { "@value": fhirDateTimeToHl7Timestamp(condition.onsetDateTime) }
              : undefined,
            high: condition.abatementDateTime
              ? { "@value": fhirDateTimeToHl7Timestamp(condition.abatementDateTime) }
              : undefined,
          }),
          value: { "@xsi:type": "CD", ...code },
        }),
      },
    },
  } as CdaNode;
}

export function buildProblemsSection(conditions: Condition[]): SectionBuildResult {
  const entries = conditions
    .map((c) => {
      const node = buildEntry(c);
      return node ? { node, resourceId: c.id ?? "unknown" } : undefined;
    })
    .filter((e): e is { node: CdaNode; resourceId: string } => e !== undefined);

  return buildSection(entries, {
    loincSection: "11450-4",
    sectionTitle: "Problems",
    fhirResourceType: "Condition",
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[Problems]/entry/act/entryRelationship/observation",
  });
}
