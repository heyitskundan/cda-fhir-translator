// Medications Administered (29549-3). Reverse of
// cda-to-fhir/sections/medications-administered.ts — see docs/CCDA_FHIR_MAPPING.md.
import type { MedicationStatement } from "../../shared/types.js";
import type { CdaNode } from "../../cda-to-fhir/parser.js";
import { buildEntry } from "./medications.js";
import { buildSection, type SectionBuildResult } from "./shared.js";

const INPATIENT_CATEGORY = "inpatient";

export function buildMedicationsAdministeredSection(
  medications: MedicationStatement[],
): SectionBuildResult {
  const matching = medications.filter((m) =>
    m.category?.some((c) => c.coding?.some((coding) => coding.code === INPATIENT_CATEGORY)),
  );

  const entries = matching
    .map((m) => {
      const node = buildEntry(m);
      return node ? { node, resourceId: m.id ?? "unknown" } : undefined;
    })
    .filter((e): e is { node: CdaNode; resourceId: string } => e !== undefined);

  return buildSection(entries, {
    loincSection: "29549-3",
    sectionTitle: "Medications Administered",
    fhirResourceType: "MedicationStatement",
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[MedicationsAdministered]/entry/substanceAdministration",
  });
}
