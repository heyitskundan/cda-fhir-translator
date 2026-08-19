import type { Reference } from "../../shared/types.js";
import type { CdaNode } from "../parser.js";
import { mapAllergiesSection } from "./allergies.js";
import { mapEncountersSection } from "./encounters.js";
import { mapFamilyHistorySection } from "./family-history.js";
import { mapImmunizationsSection } from "./immunizations.js";
import { mapMedicationsSection } from "./medications.js";
import { mapProblemsSection } from "./problems.js";
import { mapProceduresSection } from "./procedures.js";
import { mapResultsSection } from "./results.js";
import { mapSocialHistorySection } from "./social-history.js";
import { mapVitalsSection } from "./vitals.js";
import type { SectionMapResult } from "./shared.js";

/** Every CDA -> FHIR section handler this package supports. Each is independent — a
 * document missing a section simply contributes no resources for it. */
const SECTION_MAPPERS: ((root: CdaNode, patientRef: Reference) => SectionMapResult)[] = [
  mapAllergiesSection,
  mapMedicationsSection,
  mapProblemsSection,
  mapVitalsSection,
  mapResultsSection,
  mapProceduresSection,
  mapImmunizationsSection,
  mapEncountersSection,
  mapSocialHistorySection,
  mapFamilyHistorySection,
];

/** LOINC section codes this package maps. Kept in sync by test/mapping-audit.test.ts. */
export const SUPPORTED_SECTION_LOINC_CODES = [
  "48765-2", // Allergies
  "10160-0", // Medications
  "11450-4", // Problems
  "8716-3", // Vital Signs
  "30954-2", // Results
  "47519-4", // Procedures
  "11369-6", // Immunizations
  "46240-8", // Encounters
  "29762-2", // Social History
  "10157-6", // Family History
] as const;

export function mapAllSections(root: CdaNode, patientRef: Reference): SectionMapResult {
  const results = SECTION_MAPPERS.map((mapper) => mapper(root, patientRef));
  return {
    resources: results.flatMap((r) => r.resources),
    mappings: results.flatMap((r) => r.mappings),
    warnings: results.flatMap((r) => r.warnings),
  };
}

export type { SectionMapResult } from "./shared.js";
