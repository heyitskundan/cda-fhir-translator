import { describe, expect, it } from "vitest";
import { buildMedicationsAdministeredSection } from "../../../src/fhir-to-cda/sections/medications-administered.js";
import type { MedicationStatement } from "../../../src/shared/types.js";

const INPATIENT_CATEGORY = {
  coding: [
    { system: "http://terminology.hl7.org/CodeSystem/medication-statement-category", code: "inpatient" },
  ],
};

describe("buildMedicationsAdministeredSection", () => {
  it("builds a substanceAdministration entry from an inpatient MedicationStatement", () => {
    const med: MedicationStatement = {
      resourceType: "MedicationStatement",
      id: "med-admin-1",
      status: "completed",
      subject: { reference: "Patient/patient" },
      medicationCodeableConcept: { coding: [{ code: "308136" }] },
      category: [INPATIENT_CATEGORY],
    };

    const result = buildMedicationsAdministeredSection([med]);

    expect(result.section).toBeDefined();
    const entry = (result.section as Record<string, unknown>)["entry"] as Record<
      string,
      unknown
    >[];
    const built = entry[0]?.["substanceAdministration"] as Record<string, unknown>;
    expect(built["templateId"]).toMatchObject({ "@root": "2.16.840.1.113883.10.20.22.4.16" });
    expect(result.mappings).toHaveLength(1);
  });

  it("excludes a plain Medications MedicationStatement (no inpatient category)", () => {
    const med: MedicationStatement = {
      resourceType: "MedicationStatement",
      id: "med-1",
      status: "active",
      subject: { reference: "Patient/patient" },
      medicationCodeableConcept: { coding: [{ code: "x" }] },
    };
    const result = buildMedicationsAdministeredSection([med]);
    expect(result.section).toBeUndefined();
  });

  it("returns no section when there are no medications", () => {
    const result = buildMedicationsAdministeredSection([]);
    expect(result.section).toBeUndefined();
    expect(result.mappings).toEqual([]);
  });
});
