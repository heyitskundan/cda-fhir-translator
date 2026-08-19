import type { FhirBundle, TranslateOptions, TranslateResult } from "../shared/types.js";
import { TranslateError } from "../shared/errors.js";
import { parseCdaXml } from "./parser.js";
import { mapHeader } from "./header.js";
import { mapAllSections } from "./sections/index.js";

/** Translates a C-CDA 2.1 XML document into a FHIR R4 Bundle, per the mapping tables in
 * docs/CCDA_FHIR_MAPPING.md. Deterministic: the same input always produces the same
 * output. Unmappable content becomes a `warnings` entry unless `options.strict`, in
 * which case the first missing required section throws a `TranslateError`. */
export function cdaToFhir(cdaXml: string, options: TranslateOptions = {}): TranslateResult {
  const doc = parseCdaXml(cdaXml);
  const header = mapHeader(doc);
  const patientRef = { reference: `Patient/${header.patient.id}` };
  const sections = mapAllSections(doc, patientRef);

  const warnings = [...header.warnings, ...sections.warnings];
  if (options.strict && warnings.length > 0) {
    const first = warnings[0];
    throw new TranslateError(
      first?.message ?? "Unmappable content encountered in strict mode",
      "MISSING_REQUIRED_SECTION",
      first?.path ?? "ClinicalDocument",
    );
  }

  const headerResources = [
    header.patient,
    ...(header.practitioner ? [header.practitioner] : []),
    ...(header.organization ? [header.organization] : []),
    ...(header.encounter ? [header.encounter] : []),
    header.composition,
  ];

  const bundle: FhirBundle = {
    resourceType: "Bundle",
    type: "document",
    entry: [...headerResources, ...sections.resources].map((resource) => ({
      fullUrl: `urn:uuid:${resource.resourceType}-${resource.id ?? "unknown"}`,
      resource,
    })),
  };

  return {
    bundle,
    mappings: [...header.mappings, ...sections.mappings],
    warnings,
  };
}
