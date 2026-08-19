import { describe, expect, it } from "vitest";
import { buildMedicationsSection } from "../../../src/fhir-to-cda/sections/medications.js";
import type { MedicationStatement } from "../../../src/shared/types.js";

describe("buildMedicationsSection", () => {
  it("builds a substanceAdministration entry with dose and route", () => {
    const med: MedicationStatement = {
      resourceType: "MedicationStatement",
      id: "medication-1",
      status: "active",
      subject: { reference: "Patient/patient" },
      medicationCodeableConcept: {
        coding: [{ system: "http://www.nlm.nih.gov/research/umls/rxnorm", code: "197361" }],
      },
      dosage: [{ doseAndRate: [{ doseQuantity: { value: 10, unit: "mg" } }] }],
    };

    const result = buildMedicationsSection([med]);

    expect(result.section).toBeDefined();
    const entry = (result.section as Record<string, unknown>)["entry"] as Record<string, unknown>[];
    const sa = entry[0]?.["substanceAdministration"] as Record<string, unknown>;
    expect(sa["doseQuantity"]).toMatchObject({ "@value": "10", "@unit": "mg" });
  });

  it("skips a medication with no code", () => {
    const med: MedicationStatement = {
      resourceType: "MedicationStatement",
      id: "medication-1",
      status: "active",
      subject: { reference: "Patient/patient" },
    };
    expect(buildMedicationsSection([med]).section).toBeUndefined();
  });
});
