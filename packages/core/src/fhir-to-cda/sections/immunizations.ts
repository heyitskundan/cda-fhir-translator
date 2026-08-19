// Immunizations (11369-6). Reverse of cda-to-fhir/sections/immunizations.ts — see
// docs/CCDA_FHIR_MAPPING.md.
import type { Immunization } from "../../shared/types.js";
import type { CdaNode } from "../../cda-to-fhir/parser.js";
import { compact } from "../../cda-to-fhir/utils/xml-tree.js";
import { fhirDateTimeToHl7Timestamp } from "../utils/dates.js";
import { codeableConceptToCdaCode } from "../utils/coding.js";
import { buildSection, type SectionBuildResult } from "./shared.js";

const IMMUNIZATION_ACTIVITY = "2.16.840.1.113883.10.20.22.4.52";

const STATUS_MAP: Record<string, string> = {
  completed: "completed",
  "not-done": "cancelled",
};

function buildEntry(immunization: Immunization): CdaNode | undefined {
  const vaccineCode = codeableConceptToCdaCode(immunization.vaccineCode);
  if (!vaccineCode) return undefined;

  return {
    substanceAdministration: compact({
      templateId: { "@root": IMMUNIZATION_ACTIVITY },
      statusCode: { "@code": STATUS_MAP[immunization.status] ?? "completed" },
      effectiveTime: immunization.occurrenceDateTime
        ? { "@value": fhirDateTimeToHl7Timestamp(immunization.occurrenceDateTime) }
        : undefined,
      consumable: {
        manufacturedProduct: { manufacturedMaterial: { code: vaccineCode } },
      },
    }),
  } as CdaNode;
}

export function buildImmunizationsSection(immunizations: Immunization[]): SectionBuildResult {
  const entries = immunizations
    .map((i) => {
      const node = buildEntry(i);
      return node ? { node, resourceId: i.id ?? "unknown" } : undefined;
    })
    .filter((e): e is { node: CdaNode; resourceId: string } => e !== undefined);

  return buildSection(entries, {
    loincSection: "11369-6",
    sectionTitle: "Immunizations",
    fhirResourceType: "Immunization",
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[Immunizations]/entry/substanceAdministration",
  });
}
