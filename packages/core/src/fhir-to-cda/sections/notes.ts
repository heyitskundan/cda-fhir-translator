// Notes. Reverse of cda-to-fhir/sections/notes.ts — see docs/CCDA_FHIR_MAPPING.md.
//
// The original section/code (drawn from the Notes Type value set) isn't preserved on
// FHIR DocumentReference, so this rebuilds the section under the generic "Note"
// LOINC (34109-9) rather than recovering the original, more specific note type.
import type { DocumentReference } from "../../shared/types.js";
import type { CdaNode } from "../../cda-to-fhir/parser.js";
import { compact } from "../../cda-to-fhir/utils/xml-tree.js";
import { fhirDateTimeToHl7Timestamp } from "../utils/dates.js";
import { codeableConceptToCdaCode } from "../utils/coding.js";
import { buildSection, type SectionBuildResult } from "./shared.js";

const NOTES_SECTION = "2.16.840.1.113883.10.20.22.2.65";
const NOTE_ACTIVITY = "2.16.840.1.113883.10.20.22.4.202";
const GENERIC_NOTE_LOINC = "34109-9";

function buildEntry(doc: DocumentReference): CdaNode {
  const code = codeableConceptToCdaCode(doc.type);

  return {
    act: compact({
      templateId: { "@root": NOTE_ACTIVITY },
      statusCode: { "@code": doc.status === "current" ? "completed" : doc.status },
      code,
      effectiveTime: doc.date ? { "@value": fhirDateTimeToHl7Timestamp(doc.date) } : undefined,
      text: doc.description,
    }),
  } as CdaNode;
}

export function buildNotesSection(documentReferences: DocumentReference[]): SectionBuildResult {
  const entries = documentReferences.map((d) => ({
    node: buildEntry(d),
    resourceId: d.id ?? "unknown",
  }));

  const result = buildSection(entries, {
    loincSection: GENERIC_NOTE_LOINC,
    sectionTitle: "Notes",
    fhirResourceType: "DocumentReference",
    cdaPath: "ClinicalDocument/component/structuredBody/component/section[Notes]/entry/act",
  });

  if (!result.section) return result;

  // Tag the section with its own templateId, matching the C-CDA Notes Section
  // template — buildSection only sets code/title/entry, section-level templateId
  // isn't part of its generic shape.
  return {
    ...result,
    section: { ...result.section, templateId: { "@root": NOTES_SECTION } },
  };
}
