import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { cdaToFhir } from "../src/cda-to-fhir/index.js";
import { fhirToCda } from "../src/fhir-to-cda/index.js";

const ccdFixture = readFileSync(
  fileURLToPath(new URL("./fixtures/cda/ccd-synthetic.xml", import.meta.url)),
  "utf8",
);

describe("CDA -> FHIR -> CDA roundtrip", () => {
  it("produces a Bundle with no warnings when going CDA -> FHIR", () => {
    const result = cdaToFhir(ccdFixture);
    expect(result.warnings).toEqual([]);
  });

  it("produces CDA XML with no warnings when going FHIR -> CDA", () => {
    const { bundle } = cdaToFhir(ccdFixture);
    const result = fhirToCda(bundle);
    expect(result.warnings).toEqual([]);
    expect(result.xml).toContain("<ClinicalDocument");
  });

  it("re-parsing the rebuilt CDA XML recovers every resource type with no warnings", () => {
    const first = cdaToFhir(ccdFixture);
    const built = fhirToCda(first.bundle);
    const second = cdaToFhir(built.xml);

    expect(second.warnings).toEqual([]);

    const countByType = (entries: typeof first.bundle.entry) => {
      const counts: Record<string, number> = {};
      for (const e of entries)
        counts[e.resource.resourceType] = (counts[e.resource.resourceType] ?? 0) + 1;
      return counts;
    };

    expect(countByType(second.bundle.entry)).toEqual(countByType(first.bundle.entry));
  });

  it("preserves coded data (codes, dates) across the roundtrip — narrative is not tracked", () => {
    const first = cdaToFhir(ccdFixture);
    const built = fhirToCda(first.bundle);
    const second = cdaToFhir(built.xml);

    const byType = (entries: typeof first.bundle.entry, type: string) =>
      entries.filter((e) => e.resource.resourceType === type).map((e) => e.resource);

    const allergy1 = byType(first.bundle.entry, "AllergyIntolerance")[0] as {
      code?: { coding?: { code?: string }[] };
      onsetDateTime?: string;
    };
    const allergy2 = byType(second.bundle.entry, "AllergyIntolerance")[0] as typeof allergy1;
    expect(allergy2.code?.coding?.[0]?.code).toBe(allergy1.code?.coding?.[0]?.code);
    expect(allergy2.onsetDateTime).toBe(allergy1.onsetDateTime);

    const condition1 = byType(first.bundle.entry, "Condition")[0] as {
      code?: { coding?: { code?: string }[] };
      onsetDateTime?: string;
    };
    const condition2 = byType(second.bundle.entry, "Condition")[0] as typeof condition1;
    expect(condition2.code?.coding?.[0]?.code).toBe(condition1.code?.coding?.[0]?.code);
    expect(condition2.onsetDateTime).toBe(condition1.onsetDateTime);
  });
});
