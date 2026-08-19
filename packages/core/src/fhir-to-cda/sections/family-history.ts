// Family History (10157-6). Reverse of cda-to-fhir/sections/family-history.ts — see
// docs/CCDA_FHIR_MAPPING.md.
import type { FamilyMemberHistory } from "../../shared/types.js";
import type { CdaNode } from "../../cda-to-fhir/parser.js";
import { compact } from "../../cda-to-fhir/utils/xml-tree.js";
import { codeableConceptToCdaCode } from "../utils/coding.js";
import { buildSection, type SectionBuildResult } from "./shared.js";

const FAMILY_HISTORY_ORGANIZER = "2.16.840.1.113883.10.20.22.4.45";
const FAMILY_HISTORY_OBSERVATION = "2.16.840.1.113883.10.20.22.4.46";

function buildEntry(fmh: FamilyMemberHistory): CdaNode | undefined {
  const relationshipCode = codeableConceptToCdaCode(fmh.relationship);
  if (!relationshipCode) return undefined;

  const conditions = (fmh.condition ?? [])
    .map((c) => codeableConceptToCdaCode(c.code))
    .filter((code): code is NonNullable<typeof code> => code !== undefined);

  return {
    organizer: compact({
      templateId: { "@root": FAMILY_HISTORY_ORGANIZER },
      statusCode: { "@code": fmh.status },
      subject: { relatedSubject: { code: relationshipCode } },
      component: conditions.length
        ? conditions.map((code) => ({
            observation: {
              templateId: { "@root": FAMILY_HISTORY_OBSERVATION },
              value: { "@xsi:type": "CD", ...code },
            },
          }))
        : undefined,
    }),
  } as CdaNode;
}

export function buildFamilyHistorySection(
  familyMemberHistories: FamilyMemberHistory[],
): SectionBuildResult {
  const entries = familyMemberHistories
    .map((f) => {
      const node = buildEntry(f);
      return node ? { node, resourceId: f.id ?? "unknown" } : undefined;
    })
    .filter((e): e is { node: CdaNode; resourceId: string } => e !== undefined);

  return buildSection(entries, {
    loincSection: "10157-6",
    sectionTitle: "Family History",
    fhirResourceType: "FamilyMemberHistory",
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[FamilyHistory]/entry/organizer",
  });
}
