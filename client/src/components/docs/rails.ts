export interface RailItem {
  href: string;
  label: string;
  indent?: boolean;
}

// "On this page" anchor lists, one per docs page — kept separate from the page
// components themselves so those files export only a component (react-refresh's
// only-export-components rule needs that for fast refresh to stay reliable).
export const gettingStartedRail: RailItem[] = [
  { href: "#overview", label: "Overview" },
  { href: "#installation", label: "Installation" },
  { href: "#quickstart", label: "Quick start" },
  { href: "#phi", label: "Handling PHI" },
  { href: "#requirements", label: "Requirements" },
];

export const apiReferenceRail: RailItem[] = [
  { href: "#translate", label: "Translation" },
  { href: "#cdaToFhir", label: "cdaToFhir", indent: true },
  { href: "#fhirToCda", label: "fhirToCda", indent: true },
  { href: "#types", label: "Result types" },
  { href: "#errors", label: "Errors" },
  { href: "#cli", label: "CLI reference" },
];

export const dataMappingRail: RailItem[] = [
  { href: "#supported", label: "Supported sections" },
  { href: "#allergies", label: "Allergies → AllergyIntolerance" },
  { href: "#medications", label: "Medications → MedicationStatement" },
  { href: "#problems", label: "Problems → Condition" },
  { href: "#vitals", label: "Vital Signs → Observation" },
  { href: "#results", label: "Results → DiagnosticReport" },
  { href: "#procedures", label: "Procedures → Procedure" },
  { href: "#immunizations", label: "Immunizations → Immunization" },
  { href: "#encounters", label: "Encounters → Encounter" },
  { href: "#social-history", label: "Social History → Observation" },
  { href: "#family-history", label: "Family History → FamilyMemberHistory" },
  { href: "#payers", label: "Payers → Coverage" },
  { href: "#advance-directives", label: "Advance Directives → Consent" },
  {
    href: "#functional-mental-health-status",
    label: "Functional / Mental / Health Status → Observation",
  },
  { href: "#goals", label: "Goals → Goal" },
  { href: "#health-concerns", label: "Health Concerns → Condition" },
  { href: "#care-teams", label: "Care Teams → CareTeam" },
  { href: "#medications-variants", label: "Medications Administered / Admission / Discharge" },
  { href: "#medical-equipment", label: "Medical Equipment → Device" },
  { href: "#past-medical-history", label: "Past Medical History → Condition" },
  {
    href: "#planned-procedure-plan-of-treatment",
    label: "Planned Procedure / Plan of Treatment → ServiceRequest",
  },
  { href: "#notes", label: "Notes → DocumentReference" },
  { href: "#terminology", label: "Code systems" },
];

export const changelogRail: RailItem[] = [
  { href: "#v1-0-0", label: "v1.0.0" },
  { href: "#v0-3-0", label: "v0.3.0" },
  { href: "#v0-2-0", label: "v0.2.0" },
  { href: "#v0-1-0", label: "v0.1.0" },
];
