import { describe, expect, it } from "vitest";
import { buildSocialHistorySection } from "../../../src/fhir-to-cda/sections/social-history.js";
import type { Observation } from "../../../src/shared/types.js";

describe("buildSocialHistorySection", () => {
  it("builds an observation entry from a social-history Observation", () => {
    const obs: Observation = {
      resourceType: "Observation",
      id: "social-history-1",
      status: "final",
      category: [
        {
          coding: [
            { system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "social-history" },
          ],
        },
      ],
      code: { coding: [{ system: "http://loinc.org", code: "72166-2" }] },
      valueCodeableConcept: {
        coding: [{ system: "http://snomed.info/sct", code: "8517006" }],
      },
    };

    const result = buildSocialHistorySection([obs]);

    expect(result.section).toBeDefined();
    const entry = (result.section as Record<string, unknown>)["entry"] as Record<
      string,
      unknown
    >[];
    const built = entry[0]?.["observation"] as Record<string, unknown>;
    expect(built["templateId"]).toMatchObject({ "@root": "2.16.840.1.113883.10.20.22.4.78" });
    expect(result.mappings).toHaveLength(1);
  });

  it("excludes a vital-signs Observation", () => {
    const vital: Observation = {
      resourceType: "Observation",
      id: "vital-1",
      status: "final",
      category: [
        {
          coding: [
            { system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "vital-signs" },
          ],
        },
      ],
      code: { coding: [{ code: "8310-5" }] },
    };
    const result = buildSocialHistorySection([vital]);
    expect(result.section).toBeUndefined();
  });

  it("returns no section when there are no observations", () => {
    const result = buildSocialHistorySection([]);
    expect(result.section).toBeUndefined();
    expect(result.mappings).toEqual([]);
  });
});
