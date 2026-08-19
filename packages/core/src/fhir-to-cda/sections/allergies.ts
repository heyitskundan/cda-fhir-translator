// Allergies (48765-2). Reverse of cda-to-fhir/sections/allergies.ts — see
// docs/CCDA_FHIR_MAPPING.md.
import type { AllergyIntolerance } from "../../shared/types.js";
import type { CdaNode } from "../../cda-to-fhir/parser.js";
import { compact } from "../../cda-to-fhir/utils/xml-tree.js";
import { fhirDateTimeToHl7Timestamp } from "../utils/dates.js";
import { codeableConceptToCdaCode } from "../utils/coding.js";
import { buildSection, type SectionBuildResult } from "./shared.js";

const ALLERGY_CONCERN_ACT = "2.16.840.1.113883.10.20.22.4.30";
const ALLERGY_OBSERVATION = "2.16.840.1.113883.10.20.22.4.7";

function buildEntry(allergy: AllergyIntolerance): CdaNode | undefined {
  const allergenCode = codeableConceptToCdaCode(allergy.code);
  if (!allergenCode) return undefined;

  const manifestation = allergy.reaction?.[0]?.manifestation?.[0];
  const manifestationCode = codeableConceptToCdaCode(manifestation);

  return {
    act: compact({
      templateId: { "@root": ALLERGY_CONCERN_ACT },
      statusCode: { "@code": allergy.clinicalStatus?.coding?.[0]?.code ?? "active" },
      effectiveTime: allergy.onsetDateTime
        ? { low: { "@value": fhirDateTimeToHl7Timestamp(allergy.onsetDateTime) } }
        : undefined,
      entryRelationship: {
        "@typeCode": "SUBJ",
        observation: compact({
          templateId: { "@root": ALLERGY_OBSERVATION },
          participant: {
            "@typeCode": "CSM",
            participantRole: {
              "@classCode": "MANU",
              playingEntity: { "@classCode": "MMAT", code: allergenCode },
            },
          },
          value: manifestationCode ? { "@xsi:type": "CD", ...manifestationCode } : undefined,
        }),
      },
    }),
  } as CdaNode;
}

export function buildAllergiesSection(allergies: AllergyIntolerance[]): SectionBuildResult {
  const entries = allergies
    .map((a) => {
      const node = buildEntry(a);
      return node ? { node, resourceId: a.id ?? "unknown" } : undefined;
    })
    .filter((e): e is { node: CdaNode; resourceId: string } => e !== undefined);

  return buildSection(entries, {
    loincSection: "48765-2",
    sectionTitle: "Allergies",
    fhirResourceType: "AllergyIntolerance",
    cdaPath: "ClinicalDocument/component/structuredBody/component/section[Allergies]/entry/act",
  });
}
