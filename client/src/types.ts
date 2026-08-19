import type { MappingTraceEntry, TranslateWarning } from "cda-fhir-translator";

export type { MappingTraceEntry, TranslateWarning };

export type Direction = "cdaToFhir" | "fhirToCda";

/** Both `cdaToFhir` and `fhirToCda` normalized to one shape for display — the package
 * itself returns `{ bundle }` vs `{ xml }`; the UI only ever needs the rendered text. */
export interface TranslateResult {
  translated: string;
  mappings: MappingTraceEntry[];
  warnings: TranslateWarning[];
}
