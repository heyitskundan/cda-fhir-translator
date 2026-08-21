import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { SUPPORTED_SECTION_LOINC_CODES } from "../src/cda-to-fhir/sections/index.js";

const mappingDoc = readFileSync(
  fileURLToPath(new URL("../../../docs/CCDA_FHIR_MAPPING.md", import.meta.url)),
  "utf8",
);

describe("docs/CCDA_FHIR_MAPPING.md stays in sync with the section dispatcher", () => {
  it("documents every LOINC code the dispatcher maps", () => {
    for (const code of SUPPORTED_SECTION_LOINC_CODES) {
      expect(mappingDoc).toContain(code);
    }
  });

  it("doesn't leave a documented section unmapped in code (11 sections)", () => {
    expect(SUPPORTED_SECTION_LOINC_CODES).toHaveLength(11);
  });
});
