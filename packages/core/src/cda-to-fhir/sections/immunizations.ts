// Immunizations (11369-6). Mapping (see docs/CCDA_FHIR_MAPPING.md):
//   entry/substanceAdministration[templateId=...22.4.52] -> Immunization
//   consumable/manufacturedProduct/manufacturedMaterial   -> Immunization.vaccineCode (CVX)
//   statusCode/@code                                       -> Immunization.status
//   effectiveTime/@value or low                            -> Immunization.occurrenceDateTime
import type { Immunization, Reference } from "../../shared/types.js";
import type { CdaNode } from "../parser.js";
import { hl7TimestampToFhirDate } from "../utils/dates.js";
import { cdaCodeToCodeableConcept } from "../utils/coding.js";
import { attr, compact } from "../utils/xml-tree.js";
import { mapSection, type SectionMapResult } from "./shared.js";

const IMMUNIZATION_ACTIVITY = "2.16.840.1.113883.10.20.22.4.52";

const STATUS_MAP: Record<string, Immunization["status"]> = {
  completed: "completed",
  aborted: "not-done",
  cancelled: "not-done",
};

export function mapImmunizationsSection(root: CdaNode, patientRef: Reference): SectionMapResult {
  return mapSection(root, patientRef, {
    loincSection: "11369-6",
    sectionName: "Immunizations",
    templateRoot: IMMUNIZATION_ACTIVITY,
    idPrefix: "immunization",
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[Immunizations]/entry/substanceAdministration",
    fhirResourceType: "Immunization",
    build: (sa, id, patient) => {
      const material = (
        (sa["consumable"] as CdaNode | undefined)?.["manufacturedProduct"] as CdaNode | undefined
      )?.["manufacturedMaterial"] as CdaNode | undefined;
      const vaccineCode = cdaCodeToCodeableConcept(material?.["code"] as CdaNode | undefined);
      if (!vaccineCode) return undefined;

      const statusCode = attr(sa["statusCode"] as CdaNode | undefined, "code");
      const effectiveTime = sa["effectiveTime"] as CdaNode | undefined;
      const occurrenceDateTime = hl7TimestampToFhirDate(
        attr(effectiveTime, "value") ??
          attr(effectiveTime?.["low"] as CdaNode | undefined, "value"),
      );

      return compact({
        resourceType: "Immunization",
        id,
        status: (statusCode && STATUS_MAP[statusCode]) ?? "completed",
        patient,
        vaccineCode,
        occurrenceDateTime,
      }) as Immunization;
    },
  });
}
