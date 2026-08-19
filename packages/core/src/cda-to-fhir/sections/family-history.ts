// Family History (10157-6). Mapping (see docs/CCDA_FHIR_MAPPING.md):
//   entry/organizer[templateId=...22.4.45]                 -> FamilyMemberHistory
//   subject/relatedSubject/code                             -> FamilyMemberHistory.relationship
//   component/observation[templateId=...22.4.46]/value[CD]  -> FamilyMemberHistory.condition[].code
//
// One organizer produces one resource with potentially several conditions, so this
// section walks entries directly instead of using the one-entry-to-one-resource
// `mapSection` helper (same reasoning as Results).
import type { FamilyMemberHistory, MappingTraceEntry, Reference, TranslateWarning } from "../../shared/types.js";
import type { CdaNode } from "../parser.js";
import { cdaCodeToCodeableConcept } from "../utils/coding.js";
import { attr, compact, findByTemplateRoot } from "../utils/xml-tree.js";
import { findSectionByLoinc, type SectionMapResult } from "./shared.js";

const FAMILY_HISTORY_ORGANIZER = "2.16.840.1.113883.10.20.22.4.45";
const FAMILY_HISTORY_OBSERVATION = "2.16.840.1.113883.10.20.22.4.46";
const FAMILY_HISTORY_LOINC = "10157-6";
const SECTION_PATH =
  "ClinicalDocument/component/structuredBody/component/section[FamilyHistory]/entry/organizer";

export function mapFamilyHistorySection(root: CdaNode, patientRef: Reference): SectionMapResult {
  const mappings: MappingTraceEntry[] = [];
  const warnings: TranslateWarning[] = [];
  const resources: FamilyMemberHistory[] = [];

  const section = findSectionByLoinc(root, FAMILY_HISTORY_LOINC);
  if (!section) return { resources, mappings, warnings };

  const organizers = findByTemplateRoot(section, FAMILY_HISTORY_ORGANIZER);
  if (organizers.length === 0) {
    warnings.push({
      path: SECTION_PATH,
      message: "Family History section present but no entries found",
    });
  }

  organizers.forEach((organizer, i) => {
    const id = `family-member-history-${i + 1}`;
    const relatedSubject = (organizer["subject"] as CdaNode | undefined)?.[
      "relatedSubject"
    ] as CdaNode | undefined;
    const relationship = cdaCodeToCodeableConcept(relatedSubject?.["code"] as CdaNode | undefined);
    if (!relationship) {
      warnings.push({
        path: `${SECTION_PATH}[${i}]`,
        message: "Family History entry could not be mapped (missing required field)",
      });
      return;
    }

    const observationEntries = findByTemplateRoot(organizer, FAMILY_HISTORY_OBSERVATION);
    const condition = observationEntries
      .map((obs) => cdaCodeToCodeableConcept(obs["value"] as CdaNode | undefined))
      .filter((code): code is NonNullable<typeof code> => code !== undefined)
      .map((code) => ({ code }));

    const resource = compact({
      resourceType: "FamilyMemberHistory",
      id,
      status: attr(organizer["statusCode"] as CdaNode | undefined, "code") ?? "completed",
      patient: patientRef,
      relationship,
      condition: condition.length ? condition : undefined,
    }) as FamilyMemberHistory;

    resources.push(resource);
    mappings.push({
      cdaPath: `${SECTION_PATH}[${i}]`,
      fhirPath: `FamilyMemberHistory/${id}`,
      resourceType: "FamilyMemberHistory",
    });
  });

  return { resources, mappings, warnings };
}
