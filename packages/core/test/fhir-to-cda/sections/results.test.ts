import { describe, expect, it } from "vitest";
import { buildResultsSection } from "../../../src/fhir-to-cda/sections/results.js";
import type { DiagnosticReport, Observation } from "../../../src/shared/types.js";

describe("buildResultsSection", () => {
  it("builds an organizer with its referenced Observations as components", () => {
    const obs: Observation = {
      resourceType: "Observation",
      id: "diagnostic-report-1-obs-1",
      status: "final",
      code: { coding: [{ system: "http://loinc.org", code: "2345-7" }] },
      valueQuantity: { value: 98, unit: "mg/dL" },
    };
    const report: DiagnosticReport = {
      resourceType: "DiagnosticReport",
      id: "diagnostic-report-1",
      status: "final",
      code: { coding: [{ system: "http://loinc.org", code: "24323-8" }] },
      result: [{ reference: "Observation/diagnostic-report-1-obs-1" }],
    };

    const result = buildResultsSection([report], [obs]);

    expect(result.section).toBeDefined();
    const entry = (result.section as Record<string, unknown>)["entry"] as Record<string, unknown>[];
    const organizer = entry[0]?.["organizer"] as Record<string, unknown>;
    expect(organizer["templateId"]).toMatchObject({ "@root": "2.16.840.1.113883.10.20.22.4.1" });
    const components = organizer["component"] as Record<string, unknown>[];
    expect(components).toHaveLength(1);
    const observation = components[0]?.["observation"] as Record<string, unknown>;
    expect(observation["value"]).toMatchObject({
      "@xsi:type": "PQ",
      "@value": "98",
      "@unit": "mg/dL",
    });
  });
});
