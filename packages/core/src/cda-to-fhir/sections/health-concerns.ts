// Health Concerns (75310-3). Mapping (see docs/CCDA_FHIR_MAPPING.md):
//   entry/act[templateId=...22.4.132] -> Condition[category=health-concern]
//   code                                -> Condition.code
//   effectiveTime/low                   -> Condition.onsetDateTime
import type { CodeableConcept, Condition, Reference } from "../../shared/types.js";
import type { CdaNode } from "../parser.js";
import { hl7TimestampToFhirDate } from "../utils/dates.js";
import { cdaCodeToCodeableConcept } from "../utils/coding.js";
import { attr, compact } from "../utils/xml-tree.js";
import { mapSection, type SectionMapResult } from "./shared.js";

const HEALTH_CONCERN_ACT = "2.16.840.1.113883.10.20.22.4.132";

const HEALTH_CONCERN_CATEGORY: CodeableConcept = {
  coding: [
    {
      system: "http://hl7.org/fhir/us/core/CodeSystem/condition-category",
      code: "health-concern",
      display: "Health Concern",
    },
  ],
};

export function mapHealthConcernsSection(root: CdaNode, patientRef: Reference): SectionMapResult {
  return mapSection(root, patientRef, {
    loincSection: "75310-3",
    sectionName: "Health Concerns",
    templateRoot: HEALTH_CONCERN_ACT,
    idPrefix: "health-concern",
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[HealthConcerns]/entry/act",
    fhirResourceType: "Condition",
    build: (act, id, patient) => {
      const code = cdaCodeToCodeableConcept(act["code"] as CdaNode | undefined);
      if (!code) return undefined;

      const onsetDateTime = hl7TimestampToFhirDate(
        attr(
          (act["effectiveTime"] as CdaNode | undefined)?.["low"] as CdaNode | undefined,
          "value",
        ),
      );

      return compact({
        resourceType: "Condition",
        id,
        subject: patient,
        code,
        onsetDateTime,
        category: [HEALTH_CONCERN_CATEGORY],
      }) as Condition;
    },
  });
}
