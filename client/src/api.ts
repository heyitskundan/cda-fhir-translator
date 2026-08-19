import { TranslateError as PackageTranslateError, cdaToFhir, fhirToCda } from "cda-fhir-translator";
import type { Direction, TranslateResult } from "./types.js";

export class TranslateError extends Error {
  constructor(
    message: string,
    public readonly context?: string,
  ) {
    super(message);
    this.name = "TranslateError";
  }
}

/**
 * Runs entirely in the browser — the translation package has zero runtime dependencies
 * and does no I/O, so nothing here ever leaves the tab.
 */
export function translate(input: string, direction: Direction): TranslateResult {
  try {
    if (direction === "cdaToFhir") {
      const result = cdaToFhir(input);
      return {
        translated: JSON.stringify(result.bundle, null, 2),
        mappings: result.mappings,
        warnings: result.warnings,
      };
    }

    let bundle;
    try {
      bundle = JSON.parse(input);
    } catch {
      throw new TranslateError("Input is not valid JSON");
    }
    const result = fhirToCda(bundle);
    return { translated: result.xml, mappings: result.mappings, warnings: result.warnings };
  } catch (error) {
    if (error instanceof TranslateError) throw error;
    if (error instanceof PackageTranslateError) {
      throw new TranslateError(error.message, error.path);
    }
    throw error;
  }
}
