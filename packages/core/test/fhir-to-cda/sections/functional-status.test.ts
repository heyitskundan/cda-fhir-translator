import { describe, expect, it } from "vitest";
import { buildFunctionalStatusSection } from "../../../src/fhir-to-cda/sections/functional-status.js";
import type { Observation } from "../../../src/shared/types.js";

const FUNCTIONAL_STATUS_CATEGORY = {
  coding: [
    { system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "functional-status" },
  ],
};

describe("buildFunctionalStatusSection", () => {
  it("builds an observation entry from a functional-status Observation", () => {
    const obs: Observation = {
      resourceType: "Observation",
      id: "functional-status-1",
      status: "final",
      category: [FUNCTIONAL_STATUS_CATEGORY],
      code: { coding: [{ code: "G0100" }] },
    };

    const result = buildFunctionalStatusSection([obs]);

    expect(result.section).toBeDefined();
    const entry = (result.section as Record<string, unknown>)["entry"] as Record<
      string,
      unknown
    >[];
    const built = entry[0]?.["observation"] as Record<string, unknown>;
    expect(built["templateId"]).toMatchObject({ "@root": "2.16.840.1.113883.10.20.22.4.67" });
    expect(result.mappings).toHaveLength(1);
  });

  it("excludes a mental-status Observation", () => {
    const obs: Observation = {
      resourceType: "Observation",
      id: "mental-1",
      status: "final",
      category: [
        {
          coding: [
            { system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "mental-status" },
          ],
        },
      ],
      code: { coding: [{ code: "x" }] },
    };
    const result = buildFunctionalStatusSection([obs]);
    expect(result.section).toBeUndefined();
  });

  it("returns no section when there are no observations", () => {
    const result = buildFunctionalStatusSection([]);
    expect(result.section).toBeUndefined();
    expect(result.mappings).toEqual([]);
  });
});
