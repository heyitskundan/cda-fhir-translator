// Planned Procedure (59772-4). Mapping (see docs/CCDA_FHIR_MAPPING.md):
//   entry/procedure[templateId=...22.4.41] -> ServiceRequest[intent=plan]
//   code                                     -> ServiceRequest.code
//   statusCode/@code                         -> ServiceRequest.status
//   effectiveTime/@value or low              -> ServiceRequest.occurrenceDateTime
import type { Reference, ServiceRequest } from "../../shared/types.js";
import type { CdaNode } from "../parser.js";
import { hl7TimestampToFhirDate } from "../utils/dates.js";
import { cdaCodeToCodeableConcept } from "../utils/coding.js";
import { attr, compact } from "../utils/xml-tree.js";
import { mapSection, type SectionMapResult } from "./shared.js";

const PLANNED_PROCEDURE = "2.16.840.1.113883.10.20.22.4.41";

export function mapPlannedProcedureSection(
  root: CdaNode,
  patientRef: Reference,
): SectionMapResult {
  return mapSection(root, patientRef, {
    loincSection: "59772-4",
    sectionName: "Planned Procedure",
    templateRoot: PLANNED_PROCEDURE,
    idPrefix: "planned-procedure",
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[PlannedProcedure]/entry/procedure",
    fhirResourceType: "ServiceRequest",
    build: (procedure, id, patient) => {
      const code = cdaCodeToCodeableConcept(procedure["code"] as CdaNode | undefined);
      if (!code) return undefined;

      const effectiveTime = procedure["effectiveTime"] as CdaNode | undefined;
      const occurrenceDateTime = hl7TimestampToFhirDate(
        attr(effectiveTime, "value") ??
          attr(effectiveTime?.["low"] as CdaNode | undefined, "value"),
      );

      return compact({
        resourceType: "ServiceRequest",
        id,
        status: attr(procedure["statusCode"] as CdaNode | undefined, "code") ?? "active",
        intent: "plan",
        code,
        subject: patient,
        occurrenceDateTime,
      }) as ServiceRequest;
    },
  });
}
