import { describe, expect, it } from "vitest";
import { buildHealthStatusSection } from "../../../src/fhir-to-cda/sections/health-status.js";
import type { Observation } from "../../../src/shared/types.js";

const HEALTH_STATUS_CATEGORY = {
  coding: [
    { system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "health-status" },
  ],
};

describe("buildHealthStatusSection", () => {
  it("builds an observation entry, always as an Outcome Observation", () => {
    const obs: Observation = {
      resourceType: "Observation",
      id: "health-status-1",
      status: "final",
      category: [HEALTH_STATUS_CATEGORY],
      code: { coding: [{ code: "outcome-1" }] },
    };

    const result = buildHealthStatusSection([obs]);

    expect(result.section).toBeDefined();
    const entry = (result.section as Record<string, unknown>)["entry"] as Record<
      string,
      unknown
    >[];
    const built = entry[0]?.["observation"] as Record<string, unknown>;
    expect(built["templateId"]).toMatchObject({ "@root": "2.16.840.1.113883.10.20.22.4.144" });
    expect(result.mappings).toHaveLength(1);
  });

  it("returns no section when there are no observations", () => {
    const result = buildHealthStatusSection([]);
    expect(result.section).toBeUndefined();
    expect(result.mappings).toEqual([]);
  });
});
