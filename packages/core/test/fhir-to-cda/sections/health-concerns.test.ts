import { describe, expect, it } from "vitest";
import { buildHealthConcernsSection } from "../../../src/fhir-to-cda/sections/health-concerns.js";
import type { Condition } from "../../../src/shared/types.js";

const HEALTH_CONCERN_CATEGORY = {
  coding: [{ system: "http://hl7.org/fhir/us/core/CodeSystem/condition-category", code: "health-concern" }],
};

describe("buildHealthConcernsSection", () => {
  it("builds an act entry from a health-concern Condition", () => {
    const condition: Condition = {
      resourceType: "Condition",
      id: "health-concern-1",
      subject: { reference: "Patient/patient" },
      code: { coding: [{ code: "88805009" }] },
      category: [HEALTH_CONCERN_CATEGORY],
      onsetDateTime: "2020-01-01",
    };

    const result = buildHealthConcernsSection([condition]);

    expect(result.section).toBeDefined();
    const entry = (result.section as Record<string, unknown>)["entry"] as Record<
      string,
      unknown
    >[];
    const act = entry[0]?.["act"] as Record<string, unknown>;
    expect(act["templateId"]).toMatchObject({ "@root": "2.16.840.1.113883.10.20.22.4.132" });
    expect(result.mappings).toHaveLength(1);
  });

  it("excludes a plain Problems Condition (no health-concern category)", () => {
    const condition: Condition = {
      resourceType: "Condition",
      id: "problem-1",
      subject: { reference: "Patient/patient" },
      code: { coding: [{ code: "x" }] },
    };
    const result = buildHealthConcernsSection([condition]);
    expect(result.section).toBeUndefined();
  });

  it("returns no section when there are no conditions", () => {
    const result = buildHealthConcernsSection([]);
    expect(result.section).toBeUndefined();
    expect(result.mappings).toEqual([]);
  });
});
