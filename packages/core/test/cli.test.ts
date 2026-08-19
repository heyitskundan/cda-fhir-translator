import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";
import { detectDirection, resolveDirection, runTranslation } from "../src/cli-core.js";
import { cdaToFhir } from "../src/cda-to-fhir/index.js";
import { main } from "../src/cli.js";

const ccdFixture = readFileSync(
  fileURLToPath(new URL("./fixtures/cda/ccd-synthetic.xml", import.meta.url)),
  "utf8",
);

describe("detectDirection", () => {
  it("detects XML input as cdaToFhir", () => {
    expect(detectDirection(ccdFixture)).toBe("cdaToFhir");
  });

  it("detects JSON input as fhirToCda", () => {
    expect(detectDirection('{"resourceType":"Bundle"}')).toBe("fhirToCda");
  });

  it("throws for input matching neither shape", () => {
    expect(() => detectDirection("not xml or json")).toThrow();
  });
});

describe("resolveDirection", () => {
  it("uses the explicit direction when given, without inspecting the input", () => {
    expect(resolveDirection("garbage", "cdaToFhir")).toBe("cdaToFhir");
  });

  it("rejects an invalid explicit direction", () => {
    expect(() => resolveDirection(ccdFixture, "sideways")).toThrow(/must be/);
  });
});

describe("runTranslation", () => {
  it("translates CDA XML to a FHIR Bundle by default", () => {
    const { output, warnings } = runTranslation(ccdFixture, {});
    expect(warnings).toEqual([]);
    const bundle = JSON.parse(output);
    expect(bundle.resourceType).toBe("Bundle");
  });

  it("translates a FHIR Bundle back to CDA XML", () => {
    const { bundle } = cdaToFhir(ccdFixture);
    const { output, warnings } = runTranslation(JSON.stringify(bundle), {
      direction: "fhirToCda",
    });
    expect(warnings).toEqual([]);
    expect(output).toContain("<ClinicalDocument");
  });

  it("--json includes mappings and warnings alongside the translated output", () => {
    const { output } = runTranslation(ccdFixture, { json: true });
    const full = JSON.parse(output);
    expect(full.bundle.resourceType).toBe("Bundle");
    expect(Array.isArray(full.mappings)).toBe(true);
  });

  it("throws a clear error on invalid JSON input for fhirToCda", () => {
    expect(() => runTranslation("not json", { direction: "fhirToCda" })).toThrow(
      "Input is not valid JSON",
    );
  });
});

describe("main (CLI entrypoint)", () => {
  const dir = mkdtempSync(join(tmpdir(), "cda-fhir-translator-cli-test-"));

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("--help prints the help text and exits without touching -i", () => {
    const write = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    main(["--help"]);
    expect(write).toHaveBeenCalledWith(expect.stringContaining("Usage:"));
  });

  it("reads -i, writes the translated Bundle to -o, and warns on stderr", () => {
    const inPath = join(dir, "in.xml");
    const outPath = join(dir, "out.json");
    writeFileSync(inPath, ccdFixtureForCli());

    const stderr = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
    main(["-i", inPath, "-o", outPath]);

    const written = JSON.parse(readFileSync(outPath, "utf8"));
    expect(written.resourceType).toBe("Bundle");
    expect(stderr).not.toHaveBeenCalled();
  });

  it("writes to stdout when -o is omitted", () => {
    const inPath = join(dir, "in2.xml");
    writeFileSync(inPath, ccdFixtureForCli());

    const stdout = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    main(["-i", inPath]);

    expect(stdout).toHaveBeenCalledWith(expect.stringContaining('"resourceType": "Bundle"'));
  });

  function ccdFixtureForCli(): string {
    return readFileSync(
      fileURLToPath(new URL("./fixtures/cda/ccd-synthetic.xml", import.meta.url)),
      "utf8",
    );
  }
});
