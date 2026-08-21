import { describe, expect, it } from "vitest";
import { buildMentalStatusSection } from "../../../src/fhir-to-cda/sections/mental-status.js";
import type { Observation } from "../../../src/shared/types.js";

const MENTAL_STATUS_CATEGORY = {
  coding: [
    { system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "mental-status" },
  ],
};

describe("buildMentalStatusSection", () => {
  it("builds an observation entry from a mental-status Observation", () => {
    const obs: Observation = {
      resourceType: "Observation",
      id: "mental-status-1",
      status: "final",
      category: [MENTAL_STATUS_CATEGORY],
      code: { coding: [{ code: "454641000124102" }] },
    };

    const result = buildMentalStatusSection([obs]);

    expect(result.section).toBeDefined();
    const entry = (result.section as Record<string, unknown>)["entry"] as Record<
      string,
      unknown
    >[];
    const built = entry[0]?.["observation"] as Record<string, unknown>;
    expect(built["templateId"]).toMatchObject({ "@root": "2.16.840.1.113883.10.20.22.4.74" });
    expect(result.mappings).toHaveLength(1);
  });

  it("returns no section when there are no observations", () => {
    const result = buildMentalStatusSection([]);
    expect(result.section).toBeUndefined();
    expect(result.mappings).toEqual([]);
  });
});
