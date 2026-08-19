// Procedures (47519-4). Mapping (see docs/CCDA_FHIR_MAPPING.md):
//   entry/procedure[templateId=...22.4.14] -> Procedure
//   procedure/code                          -> Procedure.code
//   procedure/statusCode/@code              -> Procedure.status
//   procedure/effectiveTime/@value or low   -> Procedure.performedDateTime
import type { Procedure, Reference } from "../../shared/types.js";
import type { CdaNode } from "../parser.js";
import { hl7TimestampToFhirDate } from "../utils/dates.js";
import { cdaCodeToCodeableConcept } from "../utils/coding.js";
import { attr, compact } from "../utils/xml-tree.js";
import { mapSection, type SectionMapResult } from "./shared.js";

const PROCEDURE_ACTIVITY_PROCEDURE = "2.16.840.1.113883.10.20.22.4.14";

const STATUS_MAP: Record<string, Procedure["status"]> = {
  completed: "completed",
  active: "in-progress",
  aborted: "stopped",
  cancelled: "not-done",
  held: "on-hold",
};

export function mapProceduresSection(root: CdaNode, patientRef: Reference): SectionMapResult {
  return mapSection(root, patientRef, {
    loincSection: "47519-4",
    sectionName: "Procedures",
    templateRoot: PROCEDURE_ACTIVITY_PROCEDURE,
    idPrefix: "procedure",
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[Procedures]/entry/procedure",
    fhirResourceType: "Procedure",
    build: (procedure, id, patient) => {
      const code = cdaCodeToCodeableConcept(procedure["code"] as CdaNode | undefined);
      if (!code) return undefined;

      const statusCode = attr(procedure["statusCode"] as CdaNode | undefined, "code");
      const effectiveTime = procedure["effectiveTime"] as CdaNode | undefined;
      const performedDateTime = hl7TimestampToFhirDate(
        attr(effectiveTime, "value") ??
          attr(effectiveTime?.["low"] as CdaNode | undefined, "value"),
      );

      return compact({
        resourceType: "Procedure",
        id,
        status: (statusCode && STATUS_MAP[statusCode]) ?? "unknown",
        subject: patient,
        code,
        performedDateTime,
      }) as Procedure;
    },
  });
}
