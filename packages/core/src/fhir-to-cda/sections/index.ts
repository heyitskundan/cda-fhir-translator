import type {
  AllergyIntolerance,
  Condition,
  Consent,
  Coverage,
  DiagnosticReport,
  Device,
  DocumentReference,
  Encounter,
  FamilyMemberHistory,
  FhirResource,
  Goal,
  Immunization,
  MappingTraceEntry,
  MedicationStatement,
  Observation,
  Procedure,
  ServiceRequest,
  CareTeam,
} from "../../shared/types.js";
import type { CdaNode } from "../../cda-to-fhir/parser.js";
import { buildAdmissionMedicationsSection } from "./admission-medications.js";
import { buildAdvanceDirectivesSection } from "./advance-directives.js";
import { buildAllergiesSection } from "./allergies.js";
import { buildCareTeamsSection } from "./care-teams.js";
import { buildDischargeMedicationsSection } from "./discharge-medications.js";
import { buildEncountersSection } from "./encounters.js";
import { buildFamilyHistorySection } from "./family-history.js";
import { buildFunctionalStatusSection } from "./functional-status.js";
import { buildGoalsSection } from "./goals.js";
import { buildHealthConcernsSection } from "./health-concerns.js";
import { buildHealthStatusSection } from "./health-status.js";
import { buildImmunizationsSection } from "./immunizations.js";
import { buildMedicalEquipmentSection } from "./medical-equipment.js";
import { buildMedicationsSection } from "./medications.js";
import { buildMedicationsAdministeredSection } from "./medications-administered.js";
import { buildMentalStatusSection } from "./mental-status.js";
import { buildNotesSection } from "./notes.js";
import { buildPastMedicalHistorySection } from "./past-medical-history.js";
import { buildPayersSection } from "./payers.js";
import { buildPlanOfTreatmentSection } from "./plan-of-treatment.js";
import { buildPlannedProcedureSection } from "./planned-procedure.js";
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
 * encounter and a duplicate Encounters-section entry.
 *
 * Several sections here share a FHIR resourceType with another section (Medications /
 * Medications Administered / Admission Medications / Discharge Medications are all
 * MedicationStatement; Problems / Health Concerns / Past Medical History are all
 * Condition; Planned Procedure / Plan of Treatment are all ServiceRequest). Each
 * individual section builder is responsible for filtering to just the resources that
 * belong to it (by `category`), not this dispatcher — see each file for its filter. */
export function buildAllSections(
  resources: FhirResource[],
  headerEncounter?: Encounter,
): SectionsBuildResult {
  const observations = byType<Observation>(resources, "Observation");
  const conditions = byType<Condition>(resources, "Condition");
  const medications = byType<MedicationStatement>(resources, "MedicationStatement");
  const serviceRequests = byType<ServiceRequest>(resources, "ServiceRequest");
  const encounters = byType<Encounter>(resources, "Encounter").filter(
    (e) => e !== headerEncounter,
  );

  const results = [
    buildAllergiesSection(byType<AllergyIntolerance>(resources, "AllergyIntolerance")),
    buildMedicationsSection(medications),
    buildProblemsSection(conditions),
    buildVitalsSection(observations),
    buildResultsSection(byType<DiagnosticReport>(resources, "DiagnosticReport"), observations),
    buildProceduresSection(byType<Procedure>(resources, "Procedure")),
    buildImmunizationsSection(byType<Immunization>(resources, "Immunization")),
    buildEncountersSection(encounters),
    buildSocialHistorySection(observations),
    buildFamilyHistorySection(byType<FamilyMemberHistory>(resources, "FamilyMemberHistory")),
    buildPayersSection(byType<Coverage>(resources, "Coverage")),
    buildAdvanceDirectivesSection(byType<Consent>(resources, "Consent")),
    buildFunctionalStatusSection(observations),
    buildMentalStatusSection(observations),
    buildGoalsSection(byType<Goal>(resources, "Goal")),
    buildHealthConcernsSection(conditions),
    buildHealthStatusSection(observations),
    buildCareTeamsSection(byType<CareTeam>(resources, "CareTeam")),
    buildMedicationsAdministeredSection(medications),
    buildAdmissionMedicationsSection(medications),
    buildDischargeMedicationsSection(medications),
    buildMedicalEquipmentSection(byType<Device>(resources, "Device")),
    buildPastMedicalHistorySection(conditions),
    buildPlannedProcedureSection(serviceRequests),
    buildPlanOfTreatmentSection(serviceRequests),
    buildNotesSection(byType<DocumentReference>(resources, "DocumentReference")),
  ];

  return {
    sections: results.map((r) => r.section).filter((s): s is CdaNode => s !== undefined),
    mappings: results.flatMap((r) => r.mappings),
  };
}
