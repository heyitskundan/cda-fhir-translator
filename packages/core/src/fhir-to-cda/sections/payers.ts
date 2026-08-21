// Payers / Insurance (48768-6). Reverse of cda-to-fhir/sections/payers.ts — see
// docs/CCDA_FHIR_MAPPING.md.
import type { Coverage } from "../../shared/types.js";
import type { CdaNode } from "../../cda-to-fhir/parser.js";
import { compact } from "../../cda-to-fhir/utils/xml-tree.js";
import { codeableConceptToCdaCode } from "../utils/coding.js";
import { buildSection, type SectionBuildResult } from "./shared.js";

const COVERAGE_ACTIVITY = "2.16.840.1.113883.10.20.22.4.60";
const POLICY_ACTIVITY = "2.16.840.1.113883.10.20.22.4.61";

const STATUS_MAP: Record<string, string> = {
  active: "completed",
  cancelled: "aborted",
};

function buildEntry(coverage: Coverage): CdaNode {
  const type = codeableConceptToCdaCode(coverage.type);
  const orgName = coverage.payor?.[0]?.display;

  const policy =
    type || orgName
      ? {
          act: compact({
            templateId: { "@root": POLICY_ACTIVITY },
            code: type,
            performer: orgName
              ? {
                  "@typeCode": "PRF",
                  assignedEntity: { representedOrganization: { name: orgName } },
                }
              : undefined,
          }),
        }
      : undefined;

  return {
    act: compact({
      templateId: { "@root": COVERAGE_ACTIVITY },
      statusCode: { "@code": STATUS_MAP[coverage.status] ?? "completed" },
      entryRelationship: policy ? { "@typeCode": "COMP", ...policy } : undefined,
    }),
  } as CdaNode;
}

export function buildPayersSection(coverages: Coverage[]): SectionBuildResult {
  const entries = coverages.map((c) => ({
    node: buildEntry(c),
    resourceId: c.id ?? "unknown",
  }));

  return buildSection(entries, {
    loincSection: "48768-6",
    sectionTitle: "Payers",
    fhirResourceType: "Coverage",
    cdaPath: "ClinicalDocument/component/structuredBody/component/section[Payers]/entry/act",
  });
}
