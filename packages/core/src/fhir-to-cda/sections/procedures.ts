// Procedures (47519-4). Reverse of cda-to-fhir/sections/procedures.ts — see
// docs/CCDA_FHIR_MAPPING.md.
import type { Procedure } from "../../shared/types.js";
import type { CdaNode } from "../../cda-to-fhir/parser.js";
import { compact } from "../../cda-to-fhir/utils/xml-tree.js";
import { fhirDateTimeToHl7Timestamp } from "../utils/dates.js";
import { codeableConceptToCdaCode } from "../utils/coding.js";
import { buildSection, type SectionBuildResult } from "./shared.js";

const PROCEDURE_ACTIVITY_PROCEDURE = "2.16.840.1.113883.10.20.22.4.14";

const STATUS_MAP: Record<string, string> = {
  completed: "completed",
  "in-progress": "active",
  stopped: "aborted",
  "not-done": "cancelled",
  "on-hold": "held",
};

function buildEntry(procedure: Procedure): CdaNode | undefined {
  const code = codeableConceptToCdaCode(procedure.code);
  if (!code) return undefined;

  return {
    procedure: compact({
      templateId: { "@root": PROCEDURE_ACTIVITY_PROCEDURE },
      statusCode: { "@code": STATUS_MAP[procedure.status] ?? "completed" },
      effectiveTime: procedure.performedDateTime
        ? { "@value": fhirDateTimeToHl7Timestamp(procedure.performedDateTime) }
        : undefined,
      code,
    }),
  } as CdaNode;
}

export function buildProceduresSection(procedures: Procedure[]): SectionBuildResult {
  const entries = procedures
    .map((p) => {
      const node = buildEntry(p);
      return node ? { node, resourceId: p.id ?? "unknown" } : undefined;
    })
    .filter((e): e is { node: CdaNode; resourceId: string } => e !== undefined);

  return buildSection(entries, {
    loincSection: "47519-4",
    sectionTitle: "Procedures",
    fhirResourceType: "Procedure",
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[Procedures]/entry/procedure",
  });
}
