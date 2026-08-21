// Planned Procedure (59772-4). Reverse of
// cda-to-fhir/sections/planned-procedure.ts — see docs/CCDA_FHIR_MAPPING.md.
import type { ServiceRequest } from "../../shared/types.js";
import type { CdaNode } from "../../cda-to-fhir/parser.js";
import { compact } from "../../cda-to-fhir/utils/xml-tree.js";
import { fhirDateTimeToHl7Timestamp } from "../utils/dates.js";
import { codeableConceptToCdaCode } from "../utils/coding.js";
import { buildSection, type SectionBuildResult } from "./shared.js";

const PLANNED_PROCEDURE = "2.16.840.1.113883.10.20.22.4.41";

function buildEntry(sr: ServiceRequest): CdaNode | undefined {
  const code = codeableConceptToCdaCode(sr.code);
  if (!code) return undefined;

  return {
    procedure: compact({
      templateId: { "@root": PLANNED_PROCEDURE },
      statusCode: { "@code": sr.status },
      effectiveTime: sr.occurrenceDateTime
        ? { "@value": fhirDateTimeToHl7Timestamp(sr.occurrenceDateTime) }
        : undefined,
      code,
    }),
  } as CdaNode;
}

export function buildPlannedProcedureSection(
  serviceRequests: ServiceRequest[],
): SectionBuildResult {
  const matching = serviceRequests.filter((sr) => sr.intent === "plan" && !sr.category?.length);

  const entries = matching
    .map((sr) => {
      const node = buildEntry(sr);
      return node ? { node, resourceId: sr.id ?? "unknown" } : undefined;
    })
    .filter((e): e is { node: CdaNode; resourceId: string } => e !== undefined);

  return buildSection(entries, {
    loincSection: "59772-4",
    sectionTitle: "Planned Procedure",
    fhirResourceType: "ServiceRequest",
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[PlannedProcedure]/entry/procedure",
  });
}
