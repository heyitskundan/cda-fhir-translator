// Medications (10160-0). Reverse of cda-to-fhir/sections/medications.ts — see
// docs/CCDA_FHIR_MAPPING.md.
import type { MedicationStatement } from "../../shared/types.js";
import type { CdaNode } from "../../cda-to-fhir/parser.js";
import { compact } from "../../cda-to-fhir/utils/xml-tree.js";
import { codeableConceptToCdaCode } from "../utils/coding.js";
import { buildSection, type SectionBuildResult } from "./shared.js";

const MEDICATION_ACTIVITY = "2.16.840.1.113883.10.20.22.4.16";

function buildEntry(med: MedicationStatement): CdaNode | undefined {
  const medicationCode = codeableConceptToCdaCode(med.medicationCodeableConcept);
  if (!medicationCode) return undefined;

  const dosage = med.dosage?.[0];
  const dose = dosage?.doseAndRate?.[0]?.doseQuantity;
  const route = codeableConceptToCdaCode(dosage?.route);

  return {
    substanceAdministration: compact({
      templateId: { "@root": MEDICATION_ACTIVITY },
      statusCode: { "@code": med.status },
      routeCode: route,
      doseQuantity: dose
        ? compact({ "@value": String(dose.value), "@unit": dose.unit })
        : undefined,
      consumable: {
        manufacturedProduct: {
          manufacturedMaterial: { code: medicationCode },
        },
      },
    }),
  } as CdaNode;
}

export function buildMedicationsSection(medications: MedicationStatement[]): SectionBuildResult {
  const entries = medications
    .map((m) => {
      const node = buildEntry(m);
      return node ? { node, resourceId: m.id ?? "unknown" } : undefined;
    })
    .filter((e): e is { node: CdaNode; resourceId: string } => e !== undefined);

  return buildSection(entries, {
    loincSection: "10160-0",
    sectionTitle: "Medications",
    fhirResourceType: "MedicationStatement",
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[Medications]/entry/substanceAdministration",
  });
}
