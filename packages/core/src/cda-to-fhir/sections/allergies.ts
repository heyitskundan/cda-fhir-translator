// Allergies (48765-2). Mapping (see docs/CCDA_FHIR_MAPPING.md):
//   act[templateId=...22.4.30]                            -> AllergyIntolerance
//   observation/participant/participantRole/playingEntity -> AllergyIntolerance.code
//   observation/value[@xsi:type=CD]                        -> AllergyIntolerance.reaction[].manifestation[]
//   act/effectiveTime/low                                  -> AllergyIntolerance.onsetDateTime
//   act/statusCode/@code = active                          -> AllergyIntolerance.clinicalStatus = active
import type { AllergyIntolerance, CodeableConcept, Reference } from "../../shared/types.js";
import type { CdaNode } from "../parser.js";
import { hl7TimestampToFhirDate } from "../utils/dates.js";
import { cdaCodeToCodeableConcept } from "../utils/coding.js";
import { asArray, attr, compact } from "../utils/xml-tree.js";
import { mapSection, type SectionMapResult } from "./shared.js";

const ALLERGY_CONCERN_ACT = "2.16.840.1.113883.10.20.22.4.30";

function findAllergyObservation(act: CdaNode): CdaNode | undefined {
  for (const er of asArray(act["entryRelationship"] as CdaNode | CdaNode[] | undefined)) {
    const obs = er["observation"] as CdaNode | undefined;
    if (obs) return obs;
  }
  return undefined;
}

function mapCriticality(obs: CdaNode): AllergyIntolerance["criticality"] | undefined {
  for (const er of asArray(obs["entryRelationship"] as CdaNode | CdaNode[] | undefined)) {
    const inner = er["observation"] as CdaNode | undefined;
    const value = inner?.["value"] as CdaNode | undefined;
    const code = attr(value, "code");
    if (code === "H") return "high";
    if (code === "L") return "low";
  }
  return undefined;
}

function mapManifestations(obs: CdaNode): { manifestation?: CodeableConcept[] }[] | undefined {
  const value = obs["value"] as CdaNode | undefined;
  const manifestation = cdaCodeToCodeableConcept(value);
  return manifestation ? [{ manifestation: [manifestation] }] : undefined;
}

export function mapAllergiesSection(root: CdaNode, patientRef: Reference): SectionMapResult {
  return mapSection(root, patientRef, {
    loincSection: "48765-2",
    sectionName: "Allergies",
    templateRoot: ALLERGY_CONCERN_ACT,
    idPrefix: "allergy",
    cdaPath: "ClinicalDocument/component/structuredBody/component/section[Allergies]/entry/act",
    fhirResourceType: "AllergyIntolerance",
    build: (act, id, patient) => {
      const obs = findAllergyObservation(act);
      const allergen = obs
        ? cdaCodeToCodeableConcept(
            ((
              (
                (obs["participant"] as CdaNode | undefined)?.["participantRole"] as
                  CdaNode | undefined
              )?.["playingEntity"] as CdaNode | undefined
            )?.["code"] as CdaNode | undefined) ?? undefined,
          )
        : undefined;
      if (!allergen) return undefined;

      const statusCode = attr(act["statusCode"] as CdaNode | undefined, "code");
      const onsetDateTime = hl7TimestampToFhirDate(
        attr(
          (act["effectiveTime"] as CdaNode | undefined)?.["low"] as CdaNode | undefined,
          "value",
        ),
      );

      return compact({
        resourceType: "AllergyIntolerance",
        id,
        patient,
        code: allergen,
        clinicalStatus: statusCode
          ? {
              coding: [
                {
                  code: statusCode,
                  system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
                },
              ],
            }
          : undefined,
        onsetDateTime,
        reaction: obs ? mapManifestations(obs) : undefined,
        criticality: obs ? mapCriticality(obs) : undefined,
      }) as AllergyIntolerance;
    },
  });
}
