// FHIR R4 types below are a deliberately minimal subset — only the fields this
// package's mapping tables actually populate, not the full R4 spec surface.

export interface Coding {
  system?: string;
  code?: string;
  display?: string;
}

export interface CodeableConcept {
  coding?: Coding[];
  text?: string;
}

export interface Reference {
  reference?: string;
  display?: string;
}

export interface Identifier {
  system?: string;
  value?: string;
}

export interface HumanName {
  family?: string;
  given?: string[];
}

export interface Address {
  line?: string[];
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface ContactPoint {
  system?: "phone" | "email" | "fax" | "other";
  value?: string;
  use?: string;
}

export interface Quantity {
  value?: number;
  unit?: string;
  system?: string;
  code?: string;
}

export interface Range {
  low?: Quantity;
  high?: Quantity;
}

export interface FhirResourceBase {
  resourceType: string;
  id?: string;
}

export interface Patient extends FhirResourceBase {
  resourceType: "Patient";
  identifier?: Identifier[];
  name?: HumanName[];
  gender?: "male" | "female" | "other" | "unknown";
  birthDate?: string;
  address?: Address[];
  telecom?: ContactPoint[];
  managingOrganization?: Reference;
}

export interface Practitioner extends FhirResourceBase {
  resourceType: "Practitioner";
  identifier?: Identifier[];
  name?: HumanName[];
}

export interface Organization extends FhirResourceBase {
  resourceType: "Organization";
  identifier?: Identifier[];
  name?: string;
}

export interface Encounter extends FhirResourceBase {
  resourceType: "Encounter";
  status: "finished" | "in-progress" | "unknown";
  class?: Coding;
  subject?: Reference;
  period?: { start?: string; end?: string };
}

export interface Composition extends FhirResourceBase {
  resourceType: "Composition";
  status: "final" | "preliminary" | "entered-in-error";
  type: CodeableConcept;
  subject?: Reference;
  date?: string;
  author?: Reference[];
  confidentiality?: string;
  custodian?: Reference;
  encounter?: Reference;
}

export interface AllergyIntolerance extends FhirResourceBase {
  resourceType: "AllergyIntolerance";
  clinicalStatus?: CodeableConcept;
  code?: CodeableConcept;
  patient: Reference;
  onsetDateTime?: string;
  reaction?: { manifestation?: CodeableConcept[] }[];
  criticality?: "low" | "high" | "unable-to-assess";
}

export interface Dosage {
  route?: CodeableConcept;
  doseAndRate?: { doseQuantity?: Quantity }[];
  timing?: { repeat?: { boundsPeriod?: { start?: string; end?: string } } };
}

export interface MedicationStatement extends FhirResourceBase {
  resourceType: "MedicationStatement";
  status: string;
  medicationCodeableConcept?: CodeableConcept;
  subject: Reference;
  dosage?: Dosage[];
}

export interface Condition extends FhirResourceBase {
  resourceType: "Condition";
  clinicalStatus?: CodeableConcept;
  code?: CodeableConcept;
  subject: Reference;
  onsetDateTime?: string;
  abatementDateTime?: string;
}

export interface Observation extends FhirResourceBase {
  resourceType: "Observation";
  status: string;
  category?: CodeableConcept[];
  code: CodeableConcept;
  subject?: Reference;
  effectiveDateTime?: string;
  valueQuantity?: Quantity;
  valueCodeableConcept?: CodeableConcept;
  referenceRange?: Range[];
  interpretation?: CodeableConcept[];
}

export interface DiagnosticReport extends FhirResourceBase {
  resourceType: "DiagnosticReport";
  status: string;
  code: CodeableConcept;
  subject?: Reference;
  effectiveDateTime?: string;
  result?: Reference[];
}

export interface Procedure extends FhirResourceBase {
  resourceType: "Procedure";
  status: string;
  code?: CodeableConcept;
  subject: Reference;
  performedDateTime?: string;
}

export interface Immunization extends FhirResourceBase {
  resourceType: "Immunization";
  status: string;
  vaccineCode: CodeableConcept;
  patient: Reference;
  occurrenceDateTime?: string;
}

export interface Goal extends FhirResourceBase {
  resourceType: "Goal";
  lifecycleStatus: string;
  description: CodeableConcept;
  subject: Reference;
}

export interface CareTeam extends FhirResourceBase {
  resourceType: "CareTeam";
  status?: string;
  subject?: Reference;
  name?: string;
}

export interface ServiceRequest extends FhirResourceBase {
  resourceType: "ServiceRequest";
  status: string;
  intent: string;
  code?: CodeableConcept;
  subject: Reference;
  occurrenceDateTime?: string;
}

export interface FamilyMemberHistory extends FhirResourceBase {
  resourceType: "FamilyMemberHistory";
  status: string;
  patient: Reference;
  relationship?: CodeableConcept;
  condition?: { code?: CodeableConcept }[];
}

export interface Consent extends FhirResourceBase {
  resourceType: "Consent";
  status: string;
  subject?: Reference;
  category?: CodeableConcept[];
}

export type FhirResource =
  | Patient
  | Practitioner
  | Organization
  | Encounter
  | Composition
  | AllergyIntolerance
  | MedicationStatement
  | Condition
  | Observation
  | DiagnosticReport
  | Procedure
  | Immunization
  | Goal
  | CareTeam
  | ServiceRequest
  | Consent
  | FamilyMemberHistory;

export interface BundleEntry {
  fullUrl?: string;
  resource: FhirResource;
}

export interface FhirBundle {
  resourceType: "Bundle";
  type: "document" | "collection";
  entry: BundleEntry[];
}

// --- Package-level types ---

export interface TranslateOptions {
  strict?: boolean;
}

export interface MappingTraceEntry {
  cdaPath: string;
  fhirPath: string;
  resourceType: string;
}

export interface TranslateWarning {
  path: string;
  message: string;
}

export interface TranslateResult {
  bundle: FhirBundle;
  mappings: MappingTraceEntry[];
  warnings: TranslateWarning[];
}
