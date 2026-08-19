// Medications (10160-0). Mapping (see docs/CCDA_FHIR_MAPPING.md):
//   substanceAdministration[templateId=...22.4.16]      -> MedicationStatement
//   consumable/manufacturedProduct/manufacturedMaterial -> Medication.code (RxNorm preferred)
//   doseQuantity/@value + @unit                          -> MedicationStatement.dosage[].doseAndRate
//   routeCode/@code                                       -> MedicationStatement.dosage[].route
//   statusCode/@code                                      -> MedicationStatement.status
import type { MedicationStatement, Reference } from "../../shared/types.js";
import type { CdaNode } from "../parser.js";
import { cdaCodeToCodeableConcept } from "../utils/coding.js";
import { attr, compact } from "../utils/xml-tree.js";
import { mapSection, type SectionMapResult } from "./shared.js";

const MEDICATION_ACTIVITY = "2.16.840.1.113883.10.20.22.4.16";

export function mapMedicationsSection(root: CdaNode, patientRef: Reference): SectionMapResult {
  return mapSection(root, patientRef, {
    loincSection: "10160-0",
    sectionName: "Medications",
    templateRoot: MEDICATION_ACTIVITY,
    idPrefix: "medication",
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[Medications]/entry/substanceAdministration",
    fhirResourceType: "MedicationStatement",
    build: (sa, id, patient) => {
      const material = (
        (sa["consumable"] as CdaNode | undefined)?.["manufacturedProduct"] as CdaNode | undefined
      )?.["manufacturedMaterial"] as CdaNode | undefined;
      const medicationCodeableConcept = cdaCodeToCodeableConcept(
        material?.["code"] as CdaNode | undefined,
      );
      if (!medicationCodeableConcept) return undefined;

      const dose = sa["doseQuantity"] as CdaNode | undefined;
      const doseValue = attr(dose, "value");
      const doseUnit = attr(dose, "unit");
      const route = cdaCodeToCodeableConcept(sa["routeCode"] as CdaNode | undefined);

      const dosage =
        doseValue || route
          ? [
              compact({
                route,
                doseAndRate: doseValue
                  ? [
                      {
                        doseQuantity: compact({
                          value: Number(doseValue),
                          unit: doseUnit,
                        }),
                      },
                    ]
                  : undefined,
              }),
            ]
          : undefined;

      return compact({
        resourceType: "MedicationStatement",
        id,
        subject: patient,
        status: attr(sa["statusCode"] as CdaNode | undefined, "code") ?? "unknown",
        medicationCodeableConcept,
        dosage,
      }) as MedicationStatement;
    },
  });
}
