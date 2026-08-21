import type {
  AllergyIntolerance,
  Condition,
  Coverage,
  DiagnosticReport,
  Encounter,
  FamilyMemberHistory,
  FhirResource,
  Immunization,
  MappingTraceEntry,
  MedicationStatement,
  Observation,
  Procedure,
} from "../../shared/types.js";
import type { CdaNode } from "../../cda-to-fhir/parser.js";
import { buildAllergiesSection } from "./allergies.js";
import { buildEncountersSection } from "./encounters.js";
import { buildFamilyHistorySection } from "./family-history.js";
import { buildImmunizationsSection } from "./immunizations.js";
import { buildMedicationsSection } from "./medications.js";
import { buildPayersSection } from "./payers.js";
import { buildProblemsSection } from "./problems.js";
import { buildProceduresSection } from "./procedures.js";
import { buildResultsSection } from "./results.js";
import { buildSocialHistorySection } from "./social-history.js";
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
 * Reverse of cda-to-fhir/sections/index.ts.
 *
 * `headerEncounter`, if given, is excluded from the Encounters section — it's already
 * represented as the document header's componentOf/encompassingEncounter (see
 * fhir-to-cda/header.ts), and an Encounter resource shouldn't produce both a header
 * encounter and a duplicate Encounters-section entry. */
export function buildAllSections(
  resources: FhirResource[],
  headerEncounter?: Encounter,
): SectionsBuildResult {
  const observations = byType<Observation>(resources, "Observation");
  const encounters = byType<Encounter>(resources, "Encounter").filter(
    (e) => e !== headerEncounter,
  );

  const results = [
    buildAllergiesSection(byType<AllergyIntolerance>(resources, "AllergyIntolerance")),
    buildMedicationsSection(byType<MedicationStatement>(resources, "MedicationStatement")),
    buildProblemsSection(byType<Condition>(resources, "Condition")),
    buildVitalsSection(observations),
    buildResultsSection(byType<DiagnosticReport>(resources, "DiagnosticReport"), observations),
    buildProceduresSection(byType<Procedure>(resources, "Procedure")),
    buildImmunizationsSection(byType<Immunization>(resources, "Immunization")),
    buildEncountersSection(encounters),
    buildSocialHistorySection(observations),
    buildFamilyHistorySection(byType<FamilyMemberHistory>(resources, "FamilyMemberHistory")),
    buildPayersSection(byType<Coverage>(resources, "Coverage")),
  ];

  return {
    sections: results.map((r) => r.section).filter((s): s is CdaNode => s !== undefined),
    mappings: results.flatMap((r) => r.mappings),
  };
}
