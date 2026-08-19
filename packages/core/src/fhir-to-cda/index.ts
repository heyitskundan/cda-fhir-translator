import type { Encounter, FhirBundle, MappingTraceEntry, TranslateWarning } from "../shared/types.js";
import { compact } from "../cda-to-fhir/utils/xml-tree.js";
import { buildHeader, type HeaderInput } from "./header.js";
import { buildAllSections } from "./sections/index.js";
import { buildCdaXml } from "./utils/xml.js";

export interface TranslateToCdaResult {
  xml: string;
  mappings: MappingTraceEntry[];
  warnings: TranslateWarning[];
}

/** Translates a FHIR R4 Bundle into a C-CDA 2.1 XML document (Continuity of Care
 * Document shape — see docs/CCDA_FHIR_MAPPING.md). Reverse of `cdaToFhir`. */
export function fhirToCda(bundle: FhirBundle): TranslateToCdaResult {
  const resources = bundle.entry.map((e) => e.resource);

  const patient = resources.find((r) => r.resourceType === "Patient");
  const practitioner = resources.find((r) => r.resourceType === "Practitioner");
  const organization = resources.find((r) => r.resourceType === "Organization");
  const encounter = resources.find((r) => r.resourceType === "Encounter") as
    | Encounter
    | undefined;
  const composition = resources.find((r) => r.resourceType === "Composition");

  const warnings: TranslateWarning[] = [];
  if (!patient) {
    warnings.push({ path: "Bundle.entry", message: "No Patient resource in the input Bundle" });
  }

  const header = buildHeader(
    compact({
      // A Patient is required to build a valid recordTarget; fall back to an empty
      // shell rather than throw, matching cdaToFhir's default (non-strict)
      // warn-and-continue behavior.
      patient: patient ?? { resourceType: "Patient", id: "unknown" },
      practitioner,
      organization,
      encounter,
      composition,
    }) as HeaderInput,
  );

  const { sections, mappings } = buildAllSections(resources, encounter);

  const clinicalDocument = {
    ...header,
    component: {
      structuredBody: {
        component: sections.map((section) => ({ section })),
      },
    },
  };

  return {
    xml: buildCdaXml(clinicalDocument),
    mappings,
    warnings,
  };
}
