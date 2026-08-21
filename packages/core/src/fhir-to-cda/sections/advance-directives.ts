// Advance Directives (42348-3). Reverse of
// cda-to-fhir/sections/advance-directives.ts — see docs/CCDA_FHIR_MAPPING.md.
import type { Consent } from "../../shared/types.js";
import type { CdaNode } from "../../cda-to-fhir/parser.js";
import { compact } from "../../cda-to-fhir/utils/xml-tree.js";
import { codeableConceptToCdaCode } from "../utils/coding.js";
import { buildSection, type SectionBuildResult } from "./shared.js";

const ADVANCE_DIRECTIVE_OBSERVATION = "2.16.840.1.113883.10.20.22.4.48";

const STATUS_MAP: Record<string, string> = {
  active: "completed",
  inactive: "aborted",
  rejected: "cancelled",
};

function buildEntry(consent: Consent): CdaNode | undefined {
  const category = codeableConceptToCdaCode(consent.category?.[0]);
  if (!category) return undefined;

  return {
    observation: compact({
      templateId: { "@root": ADVANCE_DIRECTIVE_OBSERVATION },
      statusCode: { "@code": STATUS_MAP[consent.status] ?? "completed" },
      code: category,
    }),
  } as CdaNode;
}

export function buildAdvanceDirectivesSection(consents: Consent[]): SectionBuildResult {
  const entries = consents
    .map((c) => {
      const node = buildEntry(c);
      return node ? { node, resourceId: c.id ?? "unknown" } : undefined;
    })
    .filter((e): e is { node: CdaNode; resourceId: string } => e !== undefined);

  return buildSection(entries, {
    loincSection: "42348-3",
    sectionTitle: "Advance Directives",
    fhirResourceType: "Consent",
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[AdvanceDirectives]/entry/organizer/component/observation",
  });
}
