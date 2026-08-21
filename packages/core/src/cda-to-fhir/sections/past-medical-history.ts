// Past Medical History (11348-0). Reuses the Problem Observation entry template (same
// as the Problems section) — see docs/CCDA_FHIR_MAPPING.md. Tagged with a (text-only)
// category so the reverse direction can tell it apart from the plain Problems section.
import type { Condition, Reference } from "../../shared/types.js";
import type { CdaNode } from "../parser.js";
import { hl7TimestampToFhirDate } from "../utils/dates.js";
import { cdaCodeToCodeableConcept } from "../utils/coding.js";
import { attr, compact } from "../utils/xml-tree.js";
import { mapSection, type SectionMapResult } from "./shared.js";

const PROBLEM_OBSERVATION = "2.16.840.1.113883.10.20.22.4.4";
const PAST_MEDICAL_HISTORY_CATEGORY = [{ text: "Past Medical History" }];

export function mapPastMedicalHistorySection(
  root: CdaNode,
  patientRef: Reference,
): SectionMapResult {
  return mapSection(root, patientRef, {
    loincSection: "11348-0",
    sectionName: "Past Medical History",
    templateRoot: PROBLEM_OBSERVATION,
    idPrefix: "past-medical-history",
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[PastMedicalHistory]/entry/act/entryRelationship/observation",
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
        category: PAST_MEDICAL_HISTORY_CATEGORY,
      }) as Condition;
    },
  });
}
