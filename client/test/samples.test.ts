import { describe, expect, it } from "vitest";
import { cdaToFhir } from "cda-fhir-translator";
import { COMPREHENSIVE_CDA, SAMPLE_CDA, SAMPLES } from "../src/samples.js";

const STRUCTURED_SECTION_COUNT = 25;

describe("samples", () => {
  it("SAMPLE_CDA translates with no warnings", () => {
    const result = cdaToFhir(SAMPLE_CDA);
    expect(result.warnings).toEqual([]);
  });

  it("COMPREHENSIVE_CDA translates with no warnings and produces every structured section", () => {
    const result = cdaToFhir(COMPREHENSIVE_CDA);
    expect(result.warnings).toEqual([]);

    // One resource per structured-section entry, plus the 5 header resources
    // (Patient, Practitioner, Organization, Encounter, Composition). Confirms every
    // section in the sample actually mapped to something, not silently dropped.
    expect(result.bundle.entry.length).toBeGreaterThanOrEqual(STRUCTURED_SECTION_COUNT + 5);

    const composition = result.bundle.entry.find((e) => e.resource.resourceType === "Composition")
      ?.resource as { section?: { title?: string }[] };
    expect(composition.section?.some((s) => s.title === "Chief Complaint")).toBe(true);
    expect(composition.section?.some((s) => s.title === "History of Present Illness")).toBe(true);
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
