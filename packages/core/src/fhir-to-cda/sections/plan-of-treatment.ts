// Plan of Treatment (18776-5). Reverse of cda-to-fhir/sections/plan-of-treatment.ts —
// see docs/CCDA_FHIR_MAPPING.md.
//
// The forward direction collapses 7 different "Planned *" entry templates into one
// ServiceRequest(intent=plan) shape; which specific template an entry originally came
// from isn't preserved, so every entry here is rebuilt as a Planned Observation — the
// most generic of the 7 — not the original template.
import type { ServiceRequest } from "../../shared/types.js";
import type { CdaNode } from "../../cda-to-fhir/parser.js";
import { compact } from "../../cda-to-fhir/utils/xml-tree.js";
import { fhirDateTimeToHl7Timestamp } from "../utils/dates.js";
import { codeableConceptToCdaCode } from "../utils/coding.js";
import { buildSection, type SectionBuildResult } from "./shared.js";

const PLANNED_OBSERVATION = "2.16.840.1.113883.10.20.22.4.44";
const PLAN_OF_TREATMENT_CATEGORY_TEXT = "Plan of Treatment";

function buildEntry(sr: ServiceRequest): CdaNode | undefined {
  const code = codeableConceptToCdaCode(sr.code);
  if (!code) return undefined;

  return {
    observation: compact({
      templateId: { "@root": PLANNED_OBSERVATION },
      statusCode: { "@code": sr.status },
      effectiveTime: sr.occurrenceDateTime
        ? { "@value": fhirDateTimeToHl7Timestamp(sr.occurrenceDateTime) }
        : undefined,
      code,
    }),
  } as CdaNode;
}

export function buildPlanOfTreatmentSection(serviceRequests: ServiceRequest[]): SectionBuildResult {
  const matching = serviceRequests.filter(
    (sr) => sr.category?.[0]?.text === PLAN_OF_TREATMENT_CATEGORY_TEXT,
  );

  const entries = matching
    .map((sr) => {
      const node = buildEntry(sr);
      return node ? { node, resourceId: sr.id ?? "unknown" } : undefined;
    })
    .filter((e): e is { node: CdaNode; resourceId: string } => e !== undefined);

  return buildSection(entries, {
    loincSection: "18776-5",
    sectionTitle: "Plan of Treatment",
    fhirResourceType: "ServiceRequest",
    cdaPath: "ClinicalDocument/component/structuredBody/component/section[PlanOfTreatment]/entry",
  });
}
