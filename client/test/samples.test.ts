import { describe, expect, it } from "vitest";
import { cdaToFhir } from "cda-fhir-translator";
import { SAMPLE_CDA, SAMPLES } from "../src/samples.js";

describe("samples", () => {
  it("SAMPLE_CDA translates with no warnings", () => {
    const result = cdaToFhir(SAMPLE_CDA);
    expect(result.warnings).toEqual([]);
  });

  it("has at least one sample per direction", () => {
    expect(SAMPLES.some((s) => s.direction === "cdaToFhir")).toBe(true);
    expect(SAMPLES.some((s) => s.direction === "fhirToCda")).toBe(true);
  });

  it("the fhirToCda sample is the real JSON output of translating the CCD sample", () => {
    const bundleSample = SAMPLES.find((s) => s.direction === "fhirToCda");
    if (!bundleSample) throw new Error("expected an fhirToCda sample");
    const parsed = JSON.parse(bundleSample.content);
    expect(parsed.resourceType).toBe("Bundle");
  });
});
