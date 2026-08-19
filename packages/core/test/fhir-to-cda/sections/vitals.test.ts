import { describe, expect, it } from "vitest";
import { buildVitalsSection } from "../../../src/fhir-to-cda/sections/vitals.js";
import type { Observation } from "../../../src/shared/types.js";

describe("buildVitalsSection", () => {
  it("groups category=vital-signs Observations into a single organizer", () => {
    const vital: Observation = {
      resourceType: "Observation",
      id: "vital-sign-1-1",
      status: "final",
      category: [
        {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/observation-category",
              code: "vital-signs",
            },
          ],
        },
      ],
      code: { coding: [{ system: "http://loinc.org", code: "8867-4" }] },
      valueQuantity: { value: 72, unit: "/min" },
    };
    const nonVital: Observation = {
      resourceType: "Observation",
      id: "diagnostic-report-1-obs-1",
      status: "final",
      code: { coding: [{ system: "http://loinc.org", code: "2345-7" }] },
    };

    const result = buildVitalsSection([vital, nonVital]);

    expect(result.section).toBeDefined();
    const entry = (result.section as Record<string, unknown>)["entry"] as Record<string, unknown>[];
    const organizer = entry[0]?.["organizer"] as Record<string, unknown>;
    const components = organizer["component"] as Record<string, unknown>[];
    expect(components).toHaveLength(1);
  });

  it("returns no section when there are no vital-signs Observations", () => {
    const result = buildVitalsSection([]);
    expect(result.section).toBeUndefined();
  });
});
