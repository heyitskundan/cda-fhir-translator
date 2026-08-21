import { describe, expect, it } from "vitest";
import { buildDischargeMedicationsSection } from "../../../src/fhir-to-cda/sections/discharge-medications.js";
import type { MedicationStatement } from "../../../src/shared/types.js";

describe("buildDischargeMedicationsSection", () => {
  it("builds a substanceAdministration entry from a Discharge Medication", () => {
    const med: MedicationStatement = {
      resourceType: "MedicationStatement",
      id: "med-discharge-1",
      status: "active",
      subject: { reference: "Patient/patient" },
      medicationCodeableConcept: { coding: [{ code: "1049221" }] },
      category: [{ text: "Discharge Medication" }],
    };

    const result = buildDischargeMedicationsSection([med]);

    expect(result.section).toBeDefined();
    const entry = (result.section as Record<string, unknown>)["entry"] as Record<
      string,
      unknown
    >[];
    const built = entry[0]?.["substanceAdministration"] as Record<string, unknown>;
    expect(built["templateId"]).toMatchObject({ "@root": "2.16.840.1.113883.10.20.22.4.35" });
    expect(result.mappings).toHaveLength(1);
  });

  it("returns no section when there are no medications", () => {
    const result = buildDischargeMedicationsSection([]);
    expect(result.section).toBeUndefined();
    expect(result.mappings).toEqual([]);
  });
});
