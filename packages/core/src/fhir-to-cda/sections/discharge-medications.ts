// Discharge Medications (75311-1). Reverse of
// cda-to-fhir/sections/discharge-medications.ts — see docs/CCDA_FHIR_MAPPING.md.
import type { MedicationStatement } from "../../shared/types.js";
import type { CdaNode } from "../../cda-to-fhir/parser.js";
import { buildEntry } from "./medications.js";
import { buildSection, type SectionBuildResult } from "./shared.js";

const DISCHARGE_MEDICATION = "2.16.840.1.113883.10.20.22.4.35";
const DISCHARGE_CATEGORY_TEXT = "Discharge Medication";

function buildDischargeEntry(med: MedicationStatement): CdaNode | undefined {
  const node = buildEntry(med) as { substanceAdministration?: Record<string, unknown> } | undefined;
  if (!node?.substanceAdministration) return undefined;
  return {
    substanceAdministration: {
      ...node.substanceAdministration,
      templateId: { "@root": DISCHARGE_MEDICATION },
    },
  } as CdaNode;
}

export function buildDischargeMedicationsSection(
  medications: MedicationStatement[],
): SectionBuildResult {
  const matching = medications.filter((m) => m.category?.[0]?.text === DISCHARGE_CATEGORY_TEXT);

  const entries = matching
    .map((m) => {
      const node = buildDischargeEntry(m);
      return node ? { node, resourceId: m.id ?? "unknown" } : undefined;
    })
    .filter((e): e is { node: CdaNode; resourceId: string } => e !== undefined);

  return buildSection(entries, {
    loincSection: "75311-1",
    sectionTitle: "Discharge Medications",
    fhirResourceType: "MedicationStatement",
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[DischargeMedications]/entry/substanceAdministration",
  });
}
