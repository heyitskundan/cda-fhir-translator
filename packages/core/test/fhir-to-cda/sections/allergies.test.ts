import { describe, expect, it } from "vitest";
import { buildAllergiesSection } from "../../../src/fhir-to-cda/sections/allergies.js";
import type { AllergyIntolerance } from "../../../src/shared/types.js";

describe("buildAllergiesSection", () => {
  it("builds an act/observation entry from an AllergyIntolerance", () => {
    const allergy: AllergyIntolerance = {
      resourceType: "AllergyIntolerance",
      id: "allergy-1",
      patient: { reference: "Patient/patient" },
      code: { coding: [{ system: "http://www.nlm.nih.gov/research/umls/rxnorm", code: "7980" }] },
      clinicalStatus: { coding: [{ code: "active" }] },
      onsetDateTime: "2020-03-01",
    };

    const result = buildAllergiesSection([allergy]);

    expect(result.section).toBeDefined();
    const entry = (result.section as Record<string, unknown>)["entry"] as Record<string, unknown>[];
    const act = entry[0]?.["act"] as Record<string, unknown>;
    expect(act["templateId"]).toMatchObject({ "@root": "2.16.840.1.113883.10.20.22.4.30" });
    expect(act["statusCode"]).toMatchObject({ "@code": "active" });
    expect(result.mappings).toHaveLength(1);
  });

  it("returns no section when there are no allergies", () => {
    const result = buildAllergiesSection([]);
    expect(result.section).toBeUndefined();
    expect(result.mappings).toEqual([]);
  });

  it("skips an allergy with no code", () => {
    const allergy: AllergyIntolerance = {
      resourceType: "AllergyIntolerance",
      id: "allergy-1",
      patient: { reference: "Patient/patient" },
    };
    const result = buildAllergiesSection([allergy]);
    expect(result.section).toBeUndefined();
  });
});
