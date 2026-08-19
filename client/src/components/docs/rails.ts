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
  { href: "#terminology", label: "Code systems" },
];

export const changelogRail: RailItem[] = [
  { href: "#v0-2-0", label: "v0.2.0" },
  { href: "#v0-1-0", label: "v0.1.0" },
];
