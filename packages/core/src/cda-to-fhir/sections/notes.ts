// Notes (section code drawn from a value set, not one fixed LOINC — the section is
// found by its own templateId instead). Mapping (see docs/CCDA_FHIR_MAPPING.md):
//   entry/act[templateId=...22.4.202] (Note Activity) -> DocumentReference
//   code                                                -> DocumentReference.type
//   text                                                -> DocumentReference.description
//   effectiveTime/@value or low                         -> DocumentReference.date
import type { DocumentReference, MappingTraceEntry, Reference, TranslateWarning } from "../../shared/types.js";
import type { CdaNode } from "../parser.js";
import { hl7TimestampToFhirDateTime } from "../utils/dates.js";
import { cdaCodeToCodeableConcept } from "../utils/coding.js";
import { attr, compact, findByTemplateRoot } from "../utils/xml-tree.js";
import { findSectionByTemplateId, type SectionMapResult } from "./shared.js";

const NOTES_SECTION = "2.16.840.1.113883.10.20.22.2.65";
const NOTE_ACTIVITY = "2.16.840.1.113883.10.20.22.4.202";
const SECTION_PATH =
  "ClinicalDocument/component/structuredBody/component/section[Notes]/entry/act";

export function mapNotesSection(root: CdaNode, patientRef: Reference): SectionMapResult {
  const mappings: MappingTraceEntry[] = [];
  const warnings: TranslateWarning[] = [];
  const resources: DocumentReference[] = [];

  const section = findSectionByTemplateId(root, NOTES_SECTION);
  if (!section) return { resources, mappings, warnings };

  const entries = findByTemplateRoot(section, NOTE_ACTIVITY);
  if (entries.length === 0) {
    warnings.push({ path: SECTION_PATH, message: "Notes section present but no entries found" });
  }

  entries.forEach((act, i) => {
    const id = `note-${i + 1}`;
    const type = cdaCodeToCodeableConcept(act["code"] as CdaNode | undefined);
    const effectiveTime = act["effectiveTime"] as CdaNode | undefined;
    const date = hl7TimestampToFhirDateTime(
      attr(effectiveTime, "value") ?? attr(effectiveTime?.["low"] as CdaNode | undefined, "value"),
    );
    const text = typeof act["text"] === "string" ? (act["text"] as string) : undefined;

    resources.push(
      compact({
        resourceType: "DocumentReference",
        id,
        status: attr(act["statusCode"] as CdaNode | undefined, "code") ?? "current",
        type,
        subject: patientRef,
        date,
        description: text,
      }) as DocumentReference,
    );
    mappings.push({
      cdaPath: `${SECTION_PATH}[${i}]`,
      fhirPath: `DocumentReference/${id}`,
      resourceType: "DocumentReference",
    });
  });

  return { resources, mappings, warnings };
}
