// Problems (11450-4). Mapping (see docs/CCDA_FHIR_MAPPING.md):
//   act/entryRelationship/observation[templateId=...22.4.4] -> Condition
//   value[@xsi:type=CD]                                      -> Condition.code (SNOMED or ICD-10)
//   effectiveTime/low                                        -> Condition.onsetDateTime
//   effectiveTime/high                                       -> Condition.abatementDateTime
import type { Condition, Reference } from "../../shared/types.js";
import type { CdaNode } from "../parser.js";
import { hl7TimestampToFhirDate } from "../utils/dates.js";
import { cdaCodeToCodeableConcept } from "../utils/coding.js";
import { attr, compact } from "../utils/xml-tree.js";
import { mapSection, type SectionMapResult } from "./shared.js";

const PROBLEM_OBSERVATION = "2.16.840.1.113883.10.20.22.4.4";

export function mapProblemsSection(root: CdaNode, patientRef: Reference): SectionMapResult {
  return mapSection(root, patientRef, {
    loincSection: "11450-4",
    sectionName: "Problems",
    templateRoot: PROBLEM_OBSERVATION,
    idPrefix: "condition",
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[Problems]/entry/act/entryRelationship/observation",
    fhirResourceType: "Condition",
    build: (obs, id, patient) => {
      const code = cdaCodeToCodeableConcept(obs["value"] as CdaNode | undefined);
      if (!code) return undefined;

      const effectiveTime = obs["effectiveTime"] as CdaNode | undefined;
      const onsetDateTime = hl7TimestampToFhirDate(
        attr(effectiveTime?.["low"] as CdaNode | undefined, "value"),
      );
      const abatementDateTime = hl7TimestampToFhirDate(
        attr(effectiveTime?.["high"] as CdaNode | undefined, "value"),
      );

      return compact({
        resourceType: "Condition",
        id,
        subject: patient,
        code,
        onsetDateTime,
        abatementDateTime,
      }) as Condition;
    },
  });
}
