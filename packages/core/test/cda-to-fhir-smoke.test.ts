import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { cdaToFhir } from "../src/cda-to-fhir/index.js";

const ccdFixture = readFileSync(
  fileURLToPath(new URL("./fixtures/cda/ccd-synthetic.xml", import.meta.url)),
  "utf8",
);

describe("cdaToFhir (integration smoke test)", () => {
  it("translates the synthetic CCD into a document Bundle with header + section resources", () => {
    const result = cdaToFhir(ccdFixture);

    expect(result.bundle.resourceType).toBe("Bundle");
    expect(result.bundle.type).toBe("document");

    const types = result.bundle.entry.map((e) => e.resource.resourceType);
    expect(types).toContain("Patient");
    expect(types).toContain("Composition");
    expect(types).toContain("AllergyIntolerance");
    expect(types).toContain("MedicationStatement");
    expect(types).toContain("Condition");
    expect(types).toContain("DiagnosticReport");
    expect(types).toContain("Observation");

    expect(result.mappings.length).toBeGreaterThan(0);
  });

  it("throws TranslateError with a structural path in strict mode when a required section is unmappable", () => {
    const minimal = `<ClinicalDocument xmlns="urn:hl7-org:v3">
      <code code="34133-9" codeSystem="2.16.840.1.113883.6.1"/>
    </ClinicalDocument>`;
    expect(() => cdaToFhir(minimal, { strict: true })).toThrow();
  });

  it("never leaks a PHI-shaped value into a warning path", () => {
    const result = cdaToFhir(ccdFixture);
    for (const w of result.warnings) {
      expect(w.path).not.toMatch(/Synthfield|Jamie|MRN-99000123/);
    }
  });
});
