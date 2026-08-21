// Admission Medications (42346-7). Reverse of
// cda-to-fhir/sections/admission-medications.ts — see docs/CCDA_FHIR_MAPPING.md.
import type { MedicationStatement } from "../../shared/types.js";
import type { CdaNode } from "../../cda-to-fhir/parser.js";
import { buildEntry } from "./medications.js";
import { buildSection, type SectionBuildResult } from "./shared.js";

const ADMISSION_MEDICATION = "2.16.840.1.113883.10.20.22.4.36";
const ADMISSION_CATEGORY_TEXT = "Admission Medication";

function buildAdmissionEntry(med: MedicationStatement): CdaNode | undefined {
  const node = buildEntry(med) as { substanceAdministration?: Record<string, unknown> } | undefined;
  if (!node?.substanceAdministration) return undefined;
  return {
    substanceAdministration: {
      ...node.substanceAdministration,
      templateId: { "@root": ADMISSION_MEDICATION },
    },
  } as CdaNode;
}

export function buildAdmissionMedicationsSection(
  medications: MedicationStatement[],
): SectionBuildResult {
  const matching = medications.filter((m) => m.category?.[0]?.text === ADMISSION_CATEGORY_TEXT);

  const entries = matching
    .map((m) => {
      const node = buildAdmissionEntry(m);
      return node ? { node, resourceId: m.id ?? "unknown" } : undefined;
    })
    .filter((e): e is { node: CdaNode; resourceId: string } => e !== undefined);

  return buildSection(entries, {
    loincSection: "42346-7",
    sectionTitle: "Admission Medications",
    fhirResourceType: "MedicationStatement",
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[AdmissionMedications]/entry/substanceAdministration",
  });
}
