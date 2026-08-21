import type { Reference } from "../../shared/types.js";
import type { CdaNode } from "../parser.js";
import { mapAdmissionMedicationsSection } from "./admission-medications.js";
import { mapAdvanceDirectivesSection } from "./advance-directives.js";
import { mapAllergiesSection } from "./allergies.js";
import { mapCareTeamsSection } from "./care-teams.js";
import { mapDischargeMedicationsSection } from "./discharge-medications.js";
import { mapEncountersSection } from "./encounters.js";
import { mapFamilyHistorySection } from "./family-history.js";
import { mapFunctionalStatusSection } from "./functional-status.js";
import { mapGoalsSection } from "./goals.js";
import { mapHealthConcernsSection } from "./health-concerns.js";
import { mapHealthStatusSection } from "./health-status.js";
import { mapImmunizationsSection } from "./immunizations.js";
import { mapMedicalEquipmentSection } from "./medical-equipment.js";
import { mapMedicationsSection } from "./medications.js";
import { mapMedicationsAdministeredSection } from "./medications-administered.js";
import { mapMentalStatusSection } from "./mental-status.js";
import { mapNotesSection } from "./notes.js";
import { mapPastMedicalHistorySection } from "./past-medical-history.js";
import { mapPayersSection } from "./payers.js";
import { mapPlanOfTreatmentSection } from "./plan-of-treatment.js";
import { mapPlannedProcedureSection } from "./planned-procedure.js";
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
  mapPayersSection,
  mapAdvanceDirectivesSection,
  mapFunctionalStatusSection,
  mapMentalStatusSection,
  mapGoalsSection,
  mapHealthConcernsSection,
  mapHealthStatusSection,
  mapCareTeamsSection,
  mapMedicationsAdministeredSection,
  mapAdmissionMedicationsSection,
  mapDischargeMedicationsSection,
  mapMedicalEquipmentSection,
  mapPastMedicalHistorySection,
  mapPlannedProcedureSection,
  mapPlanOfTreatmentSection,
  mapNotesSection,
];

/** LOINC section codes this package maps to a discrete FHIR resource type. Notes isn't
 * included — its section code is drawn from a value set, not one fixed LOINC (see
 * notes.ts). Kept in sync by test/mapping-audit.test.ts. */
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
  "48768-6", // Payers
  "42348-3", // Advance Directives
  "47420-5", // Functional Status
  "10190-7", // Mental Status
  "61146-7", // Goals
  "75310-3", // Health Concerns
  "11383-7", // Health Status Evaluations and Outcomes
  "85847-2", // Care Teams
  "29549-3", // Medications Administered
  "42346-7", // Admission Medications
  "75311-1", // Discharge Medications
  "46264-8", // Medical Equipment
  "11348-0", // Past Medical History
  "59772-4", // Planned Procedure
  "18776-5", // Plan of Treatment
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
