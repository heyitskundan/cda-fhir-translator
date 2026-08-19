import { cdaToFhir } from "./cda-to-fhir/index.js";
import { fhirToCda } from "./fhir-to-cda/index.js";
import type { FhirBundle } from "./shared/types.js";

export type CliDirection = "cdaToFhir" | "fhirToCda";

/** Guesses direction from the input's shape: C-CDA is XML (starts with `<`), FHIR
 * input is JSON (starts with `{`). */
export function detectDirection(input: string): CliDirection {
  const trimmed = input.trimStart();
  if (trimmed.startsWith("<")) return "cdaToFhir";
  if (trimmed.startsWith("{")) return "fhirToCda";
  throw new Error(
    "Could not auto-detect translation direction from the input. Pass --direction cdaToFhir or --direction fhirToCda explicitly.",
  );
}

/** Validates an explicit `--direction` value, or falls back to `detectDirection` when
 * none was given. */
export function resolveDirection(input: string, requested: string | undefined): CliDirection {
  if (requested === undefined) return detectDirection(input);
  if (requested !== "cdaToFhir" && requested !== "fhirToCda") {
    throw new Error(`--direction must be "cdaToFhir" or "fhirToCda", got "${requested}"`);
  }
  return requested;
}

export interface CliRunOptions {
  direction?: string;
  json?: boolean;
}

export interface CliRunResult {
  output: string;
  warnings: { path: string; message: string }[];
}

/** Pure translation logic shared by the CLI entrypoint and its tests — no
 * filesystem/stdin/stdout I/O. */
export function runTranslation(input: string, options: CliRunOptions): CliRunResult {
  const direction = resolveDirection(input, options.direction);

  if (direction === "cdaToFhir") {
    const result = cdaToFhir(input);
    const output = options.json
      ? JSON.stringify(result, null, 2)
      : JSON.stringify(result.bundle, null, 2);
    return { output, warnings: result.warnings };
  }

  let bundle: FhirBundle;
  try {
    bundle = JSON.parse(input) as FhirBundle;
  } catch {
    throw new Error("Input is not valid JSON");
  }
  const result = fhirToCda(bundle);
  const output = options.json ? JSON.stringify(result, null, 2) : result.xml;
  return { output, warnings: result.warnings };
}

/** The text printed by `cda-fhir-translator --help`. */
export const HELP_TEXT = `cda-fhir-translator — deterministic C-CDA 2.1 <-> FHIR R4 translation

Usage:
  cda-fhir-translator [options]                Read from stdin, write to stdout
  cda-fhir-translator -i in.xml -o out.json     Read from/write to files

Options:
  -i, --in <file>          Input file (defaults to stdin)
  -o, --out <file>         Output file (defaults to stdout)
  -d, --direction <dir>    "cdaToFhir" or "fhirToCda" (auto-detected from input if omitted)
      --json                Print the full result ({ bundle|xml, mappings, warnings }) instead of just the translated output
  -h, --help                Show this help text

Examples:
  cda-fhir-translator -i patient.xml
  cda-fhir-translator -i bundle.fhir.json -d fhirToCda
  cat patient.xml | cda-fhir-translator --json
`;
