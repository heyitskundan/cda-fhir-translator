import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseCdaXml } from "../src/cda-to-fhir/parser.js";
import { TranslateError } from "../src/shared/errors.js";

const ccdFixture = readFileSync(
  fileURLToPath(new URL("./fixtures/cda/ccd-synthetic.xml", import.meta.url)),
  "utf8",
);

describe("parseCdaXml", () => {
  it("parses a synthetic CCD into a ClinicalDocument node", () => {
    const doc = parseCdaXml(ccdFixture);
    expect(doc["code"]).toMatchObject({ "@code": "34133-9" });
  });

  it("throws a TranslateError with a structural path, not a value, on malformed XML", () => {
    expect(() => parseCdaXml("<ClinicalDocument><unclosed></ClinicalDocument>")).toThrow(
      TranslateError,
    );
  });

  it("throws a TranslateError when the root ClinicalDocument element is missing", () => {
    expect(() => parseCdaXml("<NotClinicalDocument/>")).toThrow(TranslateError);
  });
});
