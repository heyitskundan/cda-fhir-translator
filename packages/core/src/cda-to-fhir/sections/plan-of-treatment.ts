// Plan of Treatment (18776-5). Mapping (see docs/CCDA_FHIR_MAPPING.md):
//   entry/{act,encounter,observation,procedure,substanceAdministration,supply}
//   [templateId=one of 7 "Planned *" / Instruction templates] -> ServiceRequest[intent=plan]
//
// HL7 hasn't published a FHIR mapping for any of these 7 entry templates, and each
// would plausibly map to a different FHIR resource (Task/Appointment/
// ImmunizationRecommendation/MedicationRequest/ServiceRequest/...). Rather than invent
// 7 unverified conventions, every planned-activity entry collapses into one
// ServiceRequest(intent=plan) — a documented simplification, not an IG-confirmed
// mapping. "Planned Coverage" is excluded — it's C-CDA 3.0-ballot content, not
// confirmed as part of the 2.1 spec this package targets.
import type { MappingTraceEntry, Reference, ServiceRequest, TranslateWarning } from "../../shared/types.js";
import type { CdaNode } from "../parser.js";
import { hl7TimestampToFhirDate } from "../utils/dates.js";
import { cdaCodeToCodeableConcept } from "../utils/coding.js";
import { attr, compact, findByTemplateRoot } from "../utils/xml-tree.js";
import { findSectionByLoinc, type SectionMapResult } from "./shared.js";

const PLAN_OF_TREATMENT_LOINC = "18776-5";
const SECTION_PATH = "ClinicalDocument/component/structuredBody/component/section[PlanOfTreatment]/entry";

const PLANNED_TEMPLATES = [
  "2.16.840.1.113883.10.20.22.4.39", // Planned Act
  "2.16.840.1.113883.10.20.22.4.40", // Planned Encounter
  "2.16.840.1.113883.10.20.22.4.120", // Planned Immunization Activity
  "2.16.840.1.113883.10.20.22.4.42", // Planned Medication Activity
  "2.16.840.1.113883.10.20.22.4.44", // Planned Observation
  "2.16.840.1.113883.10.20.22.4.41", // Planned Procedure
  "2.16.840.1.113883.10.20.22.4.43", // Planned Supply
  "2.16.840.1.113883.10.20.22.4.20", // Instruction
] as const;

const PLAN_OF_TREATMENT_CATEGORY = [{ text: "Plan of Treatment" }];

function extractCode(entry: CdaNode): CdaNode | undefined {
  const direct = entry["code"] as CdaNode | undefined;
  if (direct && (direct["@code"] || direct["@nullFlavor"])) return direct;

  // Planned Medication Activity has no top-level code — it nests one the same way
  // Medication Activity does.
  const material = (
    (entry["consumable"] as CdaNode | undefined)?.["manufacturedProduct"] as CdaNode | undefined
  )?.["manufacturedMaterial"] as CdaNode | undefined;
  return material?.["code"] as CdaNode | undefined;
}

export function mapPlanOfTreatmentSection(root: CdaNode, patientRef: Reference): SectionMapResult {
  const mappings: MappingTraceEntry[] = [];
  const warnings: TranslateWarning[] = [];
  const resources: ServiceRequest[] = [];

  const section = findSectionByLoinc(root, PLAN_OF_TREATMENT_LOINC);
  if (!section) return { resources, mappings, warnings };

  let count = 0;
  for (const templateRoot of PLANNED_TEMPLATES) {
    const entries = findByTemplateRoot(section, templateRoot);
    entries.forEach((entry) => {
      const code = cdaCodeToCodeableConcept(extractCode(entry));
      if (!code) return;

      count += 1;
      const id = `plan-of-treatment-${count}`;
      const effectiveTime = entry["effectiveTime"] as CdaNode | undefined;
      const occurrenceDateTime = hl7TimestampToFhirDate(
        attr(effectiveTime, "value") ??
          attr(effectiveTime?.["low"] as CdaNode | undefined, "value"),
      );

      resources.push(
        compact({
          resourceType: "ServiceRequest",
          id,
          status: attr(entry["statusCode"] as CdaNode | undefined, "code") ?? "active",
          intent: "plan",
          code,
          subject: patientRef,
          occurrenceDateTime,
          category: PLAN_OF_TREATMENT_CATEGORY,
        }) as ServiceRequest,
      );
      mappings.push({
        cdaPath: `${SECTION_PATH}[templateId=${templateRoot}]`,
        fhirPath: `ServiceRequest/${id}`,
        resourceType: "ServiceRequest",
      });
    });
  }

  if (count === 0) {
    warnings.push({
      path: SECTION_PATH,
      message: "Plan of Treatment section present but no entries found",
    });
  }

  return { resources, mappings, warnings };
}
