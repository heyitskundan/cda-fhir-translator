export { cdaToFhir } from "./cda-to-fhir/index.js";
export { fhirToCda } from "./fhir-to-cda/index.js";
export type { TranslateToCdaResult } from "./fhir-to-cda/index.js";
export { TranslateError } from "./shared/errors.js";
export type { TranslateErrorCode } from "./shared/errors.js";
export type {
  FhirBundle,
  FhirResource,
  MappingTraceEntry,
  TranslateOptions,
  TranslateResult,
  TranslateWarning,
} from "./shared/types.js";
