import { describe, expect, it } from "vitest";
import { buildAdmissionMedicationsSection } from "../../../src/fhir-to-cda/sections/admission-medications.js";
import type { MedicationStatement } from "../../../src/shared/types.js";

describe("buildAdmissionMedicationsSection", () => {
  it("builds a substanceAdministration entry from an Admission Medication", () => {
    const med: MedicationStatement = {
      resourceType: "MedicationStatement",
      id: "med-admission-1",
      status: "active",
      subject: { reference: "Patient/patient" },
      medicationCodeableConcept: { coding: [{ code: "197517" }] },
      category: [{ text: "Admission Medication" }],
    };

    const result = buildAdmissionMedicationsSection([med]);

    expect(result.section).toBeDefined();
    const entry = (result.section as Record<string, unknown>)["entry"] as Record<
      string,
      unknown
    >[];
    const built = entry[0]?.["substanceAdministration"] as Record<string, unknown>;
    expect(built["templateId"]).toMatchObject({ "@root": "2.16.840.1.113883.10.20.22.4.36" });
    expect(result.mappings).toHaveLength(1);
  });

  it("excludes a medication with no matching category text", () => {
    const med: MedicationStatement = {
      resourceType: "MedicationStatement",
      id: "med-1",
      status: "active",
      subject: { reference: "Patient/patient" },
      medicationCodeableConcept: { coding: [{ code: "x" }] },
    };
    const result = buildAdmissionMedicationsSection([med]);
    expect(result.section).toBeUndefined();
  });

  it("returns no section when there are no medications", () => {
    const result = buildAdmissionMedicationsSection([]);
    expect(result.section).toBeUndefined();
    expect(result.mappings).toEqual([]);
  });
});
