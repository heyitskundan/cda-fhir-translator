import type {
  AllergyIntolerance,
  Condition,
  DiagnosticReport,
  FhirResource,
  MappingTraceEntry,
  MedicationStatement,
  Observation,
} from "../../shared/types.js";
import type { CdaNode } from "../../cda-to-fhir/parser.js";
import { buildAllergiesSection } from "./allergies.js";
import { buildMedicationsSection } from "./medications.js";
import { buildProblemsSection } from "./problems.js";
import { buildResultsSection } from "./results.js";
import { buildVitalsSection } from "./vitals.js";

export interface SectionsBuildResult {
  /** `<section>` nodes for every section that had matching resources. */
  sections: CdaNode[];
  mappings: MappingTraceEntry[];
}

function byType<T extends FhirResource>(resources: FhirResource[], resourceType: string): T[] {
  return resources.filter((r) => r.resourceType === resourceType) as T[];
}

/** Builds every CDA section this package supports from the resources in a FHIR Bundle.
 * Reverse of cda-to-fhir/sections/index.ts. */
export function buildAllSections(resources: FhirResource[]): SectionsBuildResult {
  const observations = byType<Observation>(resources, "Observation");

  const results = [
    buildAllergiesSection(byType<AllergyIntolerance>(resources, "AllergyIntolerance")),
    buildMedicationsSection(byType<MedicationStatement>(resources, "MedicationStatement")),
    buildProblemsSection(byType<Condition>(resources, "Condition")),
    buildVitalsSection(observations),
    buildResultsSection(byType<DiagnosticReport>(resources, "DiagnosticReport"), observations),
  ];

  return {
    sections: results.map((r) => r.section).filter((s): s is CdaNode => s !== undefined),
    mappings: results.flatMap((r) => r.mappings),
  };
}
