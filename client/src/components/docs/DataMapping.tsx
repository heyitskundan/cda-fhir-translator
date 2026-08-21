import type { ReactNode } from "react";

const muted = { opacity: 0.85 };

/** Renders inline `backtick` spans as <code>, matching the convention
 * docs/CCDA_FHIR_MAPPING.md already uses for field/path tokens — this lets the data
 * below stay plain strings instead of JSX, so adding a section or a field row is a data
 * change, not a new hand-written block of markup. */
function renderInline(text: string): ReactNode {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) =>
    part.startsWith("`") && part.endsWith("`") ? (
      <code key={i}>{part.slice(1, -1)}</code>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

interface SupportedSection {
  loinc: string;
  label: string;
  fhir: string;
}

const SUPPORTED_SECTIONS: SupportedSection[] = [
  { loinc: "48765-2", label: "Allergies", fhir: "AllergyIntolerance" },
  { loinc: "10160-0", label: "Medications", fhir: "MedicationStatement" },
  { loinc: "11450-4", label: "Problems", fhir: "Condition" },
  { loinc: "8716-3", label: "Vital Signs", fhir: "Observation[category=vital-signs]" },
  { loinc: "30954-2", label: "Results", fhir: "DiagnosticReport + Observation[]" },
  { loinc: "47519-4", label: "Procedures", fhir: "Procedure" },
  { loinc: "11369-6", label: "Immunizations", fhir: "Immunization" },
  { loinc: "46240-8", label: "Encounters", fhir: "Encounter" },
  { loinc: "29762-2", label: "Social History", fhir: "Observation[category=social-history]" },
  { loinc: "10157-6", label: "Family History", fhir: "FamilyMemberHistory" },
  { loinc: "48768-6", label: "Payers", fhir: "Coverage" },
  { loinc: "42348-3", label: "Advance Directives", fhir: "Consent" },
  { loinc: "47420-5", label: "Functional Status", fhir: "Observation[category=functional-status]" },
  { loinc: "10190-7", label: "Mental Status", fhir: "Observation[category=mental-status]" },
  { loinc: "61146-7", label: "Goals", fhir: "Goal" },
  { loinc: "75310-3", label: "Health Concerns", fhir: "Condition[category=health-concern]" },
  {
    loinc: "11383-7",
    label: "Health Status Evaluations and Outcomes",
    fhir: "Observation[category=health-status]",
  },
  { loinc: "85847-2", label: "Care Teams", fhir: "CareTeam" },
  {
    loinc: "29549-3",
    label: "Medications Administered",
    fhir: "MedicationStatement[category=inpatient]",
  },
  { loinc: "42346-7", label: "Admission Medications", fhir: "MedicationStatement" },
  { loinc: "75311-1", label: "Discharge Medications", fhir: "MedicationStatement" },
  { loinc: "46264-8", label: "Medical Equipment", fhir: "Device" },
  { loinc: "11348-0", label: "Past Medical History", fhir: "Condition" },
  { loinc: "59772-4", label: "Planned Procedure", fhir: "ServiceRequest[intent=plan]" },
  { loinc: "18776-5", label: "Plan of Treatment", fhir: "ServiceRequest[intent=plan]" },
  { loinc: "(value set)", label: "Notes", fhir: "DocumentReference" },
];

interface FieldRow {
  cda: string;
  fhir: string;
  note: string;
}

interface SectionTable {
  label?: string;
  labelNote?: string;
  rows: FieldRow[];
}

interface MappingSection {
  id: string;
  title: string;
  description: string;
  tables: SectionTable[];
  footnote?: string;
}

const HEADER_TABLE: SectionTable = {
  label: "Header",
  labelNote: "shared by every C-CDA document",
  rows: [
    {
      cda: "recordTarget/patientRole",
      fhir: "Patient",
      note: "id[@root=SSN OID] → identifier (us-ssn system); other id → urn:oid:<root>",
    },
    {
      cda: "patient/administrativeGenderCode",
      fhir: "Patient.gender",
      note: "M/F/UN → male/female/unknown",
    },
    { cda: "patient/birthTime", fhir: "Patient.birthDate", note: "date only, time truncated" },
    { cda: "author/assignedAuthor", fhir: "Practitioner", note: "—" },
    { cda: "custodian/.../representedCustodianOrganization", fhir: "Organization", note: "—" },
    { cda: "componentOf/encompassingEncounter", fhir: "Encounter", note: "—" },
    {
      cda: "ClinicalDocument (code/effectiveTime/confidentialityCode)",
      fhir: "Composition",
      note: "—",
    },
  ],
};

const MAPPING_SECTIONS: MappingSection[] = [
  {
    id: "allergies",
    title: "Allergies (48765-2) → AllergyIntolerance",
    description:
      "Entry template root `2.16.840.1.113883.10.20.22.4.30` (Allergy Concern Act), verified against the C-CDA 2.1 spec.",
    tables: [
      {
        rows: [
          {
            cda: "observation/participant/participantRole/playingEntity/code",
            fhir: "AllergyIntolerance.code",
            note: "The allergen",
          },
          {
            cda: "act/statusCode/@code = active",
            fhir: "AllergyIntolerance.clinicalStatus",
            note: "= active",
          },
          { cda: "act/effectiveTime/low", fhir: "AllergyIntolerance.onsetDateTime", note: "—" },
          {
            cda: "observation/value[@xsi:type=CD]",
            fhir: "AllergyIntolerance.reaction[].manifestation[]",
            note: "Nested observation",
          },
        ],
      },
    ],
  },
  {
    id: "medications",
    title: "Medications (10160-0) → MedicationStatement",
    description:
      "Entry template root `2.16.840.1.113883.10.20.22.4.16` (Medication Activity), verified against the C-CDA 2.1 spec.",
    tables: [
      {
        rows: [
          {
            cda: "consumable/.../manufacturedMaterial/code",
            fhir: "MedicationStatement.medicationCodeableConcept",
            note: "RxNorm preferred",
          },
          {
            cda: "doseQuantity",
            fhir: "MedicationStatement.dosage[].doseAndRate[].doseQuantity",
            note: "—",
          },
          { cda: "routeCode", fhir: "MedicationStatement.dosage[].route", note: "—" },
          { cda: "statusCode/@code", fhir: "MedicationStatement.status", note: "—" },
        ],
      },
    ],
  },
  {
    id: "problems",
    title: "Problems (11450-4) → Condition",
    description:
      "Entry template root `2.16.840.1.113883.10.20.22.4.4` (Problem Observation), verified against the C-CDA 2.1 spec.",
    tables: [
      {
        rows: [
          { cda: "value[@xsi:type=CD]", fhir: "Condition.code", note: "SNOMED or ICD-10" },
          { cda: "effectiveTime/low", fhir: "Condition.onsetDateTime", note: "—" },
          { cda: "effectiveTime/high", fhir: "Condition.abatementDateTime", note: "—" },
        ],
      },
    ],
  },
  {
    id: "results",
    title: "Results (30954-2) → DiagnosticReport + Observation[]",
    description:
      "Entry template root `2.16.840.1.113883.10.20.22.4.1` (Result Organizer), verified against the C-CDA 2.1 spec.",
    tables: [
      {
        rows: [
          { cda: "organizer/code", fhir: "DiagnosticReport.code", note: "—" },
          {
            cda: "component/observation",
            fhir: "Observation[] (referenced)",
            note: "One per component",
          },
          { cda: "value[@xsi:type=PQ]", fhir: "Observation.valueQuantity", note: "—" },
          { cda: "value[@xsi:type=CD]", fhir: "Observation.valueCodeableConcept", note: "—" },
          { cda: "interpretationCode", fhir: "Observation.interpretation", note: "—" },
        ],
      },
    ],
  },
  {
    id: "vitals",
    title: "Vital Signs (8716-3) → Observation[category=vital-signs]",
    description:
      "Same organizer template as Results — distinguished by section LOINC, not a different entry template.",
    tables: [
      {
        rows: [
          {
            cda: "organizer (via component/observation)",
            fhir: "Observation[category=vital-signs]",
            note: "No DiagnosticReport built for this section",
          },
        ],
      },
    ],
    footnote:
      "FHIR → C-CDA can't recover the original organizer grouping: `cdaToFhir` preserves each source `<organizer>` as a separate group, but that grouping isn't carried on the FHIR Observation resources — only `category=vital-signs` is. `fhirToCda` groups all vital-signs Observations into a single organizer; coded data round-trips, the grouping doesn't.",
  },
  {
    id: "procedures",
    title: "Procedures (47519-4) → Procedure",
    description:
      "Entry template root `2.16.840.1.113883.10.20.22.4.14` (Procedure Activity Procedure V2), verified against the C-CDA 2.1 spec.",
    tables: [
      {
        rows: [
          { cda: "procedure/code", fhir: "Procedure.code", note: "CPT-4 or SNOMED" },
          {
            cda: "procedure/statusCode/@code",
            fhir: "Procedure.status",
            note: "completed/active/aborted/cancelled/held → completed/in-progress/stopped/not-done/on-hold",
          },
          {
            cda: "procedure/effectiveTime/@value or low",
            fhir: "Procedure.performedDateTime",
            note: "—",
          },
        ],
      },
    ],
  },
  {
    id: "immunizations",
    title: "Immunizations (11369-6) → Immunization",
    description:
      "Entry template root `2.16.840.1.113883.10.20.22.4.52` (Immunization Activity V3), verified against the C-CDA 2.1 spec.",
    tables: [
      {
        rows: [
          {
            cda: "consumable/.../manufacturedMaterial/code",
            fhir: "Immunization.vaccineCode",
            note: "CVX",
          },
          {
            cda: "statusCode/@code",
            fhir: "Immunization.status",
            note: "completed/aborted/cancelled → completed/not-done/not-done",
          },
          {
            cda: "effectiveTime/@value or low",
            fhir: "Immunization.occurrenceDateTime",
            note: "—",
          },
        ],
      },
    ],
  },
  {
    id: "encounters",
    title: "Encounters (46240-8) → Encounter",
    description:
      "Entry template root `2.16.840.1.113883.10.20.22.4.49` (Encounter Activity V3), verified against the C-CDA 2.1 spec. Distinct from the header's componentOf/encompassingEncounter.",
    tables: [
      {
        rows: [
          { cda: "code", fhir: "Encounter.class", note: "A Coding, not a CodeableConcept" },
          {
            cda: "statusCode/@code",
            fhir: "Encounter.status",
            note: "completed/active → finished/in-progress",
          },
          {
            cda: "effectiveTime/@value or low/high",
            fhir: "Encounter.period",
            note: "—",
          },
        ],
      },
    ],
    footnote:
      "`fhirToCda` treats the first `Encounter` resource in the input Bundle as the document header's encounter and excludes it from this section, so it isn't built twice.",
  },
  {
    id: "social-history",
    title: "Social History (29762-2) → Observation[category=social-history]",
    description:
      "Entry template root `2.16.840.1.113883.10.20.22.4.78` (Smoking Status Observation), verified against the C-CDA 2.1 spec. Covers Smoking Status only, not the full Social History section.",
    tables: [
      {
        rows: [
          {
            cda: "observation (not organizer-grouped)",
            fhir: "Observation[category=social-history]",
            note: "One entry per observation",
          },
        ],
      },
    ],
  },
  {
    id: "family-history",
    title: "Family History (10157-6) → FamilyMemberHistory",
    description:
      "Entry template root `2.16.840.1.113883.10.20.22.4.45` (Family History Organizer V3), verified against the C-CDA 2.1 spec.",
    tables: [
      {
        rows: [
          {
            cda: "subject/relatedSubject/code",
            fhir: "FamilyMemberHistory.relationship",
            note: "—",
          },
          {
            cda: "component/observation/value[@xsi:type=CD]",
            fhir: "FamilyMemberHistory.condition[].code",
            note: "One per nested Family History Observation",
          },
        ],
      },
    ],
  },
  {
    id: "payers",
    title: "Payers (48768-6) → Coverage",
    description:
      "Entry template root `2.16.840.1.113883.10.20.22.4.60` (Coverage Activity V3), verified against the C-CDA 2.1 spec.",
    tables: [
      {
        rows: [
          {
            cda: "statusCode/@code",
            fhir: "Coverage.status",
            note: "completed/active → active, aborted/cancelled → cancelled",
          },
          {
            cda: "entryRelationship/act[Policy Activity]/code",
            fhir: "Coverage.type",
            note: "—",
          },
          {
            cda: ".../representedOrganization/name",
            fhir: "Coverage.payor[].display",
            note: "Display-only — no Organization resource is created",
          },
        ],
      },
    ],
  },
  {
    id: "advance-directives",
    title: "Advance Directives (42348-3) → Consent",
    description:
      "Entry template root `2.16.840.1.113883.10.20.22.4.48` (Advance Directive Observation), verified against the C-CDA 2.1 spec.",
    tables: [
      {
        rows: [
          { cda: "code", fhir: "Consent.category", note: "—" },
          {
            cda: "statusCode/@code",
            fhir: "Consent.status",
            note: "completed/active → active, aborted → inactive, cancelled → rejected",
          },
        ],
      },
    ],
  },
  {
    id: "functional-mental-health-status",
    title: "Functional Status / Mental Status / Health Status Evaluations and Outcomes",
    description:
      "Three Observation-based sections, same field mapping as Results' component/observation (see above). Tagged with a category that's this package's own convention (functional-status, mental-status, health-status), not one drawn from the C-CDA-on-FHIR IG.",
    tables: [
      {
        rows: [
          {
            cda: "47420-5 → observation[...4.67]",
            fhir: "Observation[category=functional-status]",
            note: "—",
          },
          {
            cda: "10190-7 → observation[...4.74]",
            fhir: "Observation[category=mental-status]",
            note: "—",
          },
          {
            cda: "11383-7 → observation[...4.144 or ...4.110]",
            fhir: "Observation[category=health-status]",
            note: "Two entry templates (Outcome / Progress Toward Goal); which one isn't recoverable on a roundtrip",
          },
        ],
      },
    ],
  },
  {
    id: "goals",
    title: "Goals (61146-7) → Goal",
    description:
      "Entry template root `2.16.840.1.113883.10.20.22.4.121` (Goal Observation), verified against the C-CDA 2.1 spec.",
    tables: [
      {
        rows: [
          { cda: "code", fhir: "Goal.description", note: "—" },
          { cda: "statusCode/@code", fhir: "Goal.lifecycleStatus", note: "—" },
        ],
      },
    ],
  },
  {
    id: "health-concerns",
    title: "Health Concerns (75310-3) → Condition[category=health-concern]",
    description:
      "Entry template root `2.16.840.1.113883.10.20.22.4.132` (Health Concern Act), verified against the C-CDA 2.1 spec.",
    tables: [
      {
        rows: [
          { cda: "code", fhir: "Condition.code", note: "—" },
          { cda: "effectiveTime/low", fhir: "Condition.onsetDateTime", note: "—" },
        ],
      },
    ],
    footnote:
      "Always tagged `category=health-concern` (the real US Core condition-category code) so the reverse direction can tell it apart from the plain Problems section.",
  },
  {
    id: "care-teams",
    title: "Care Teams (85847-2) → CareTeam",
    description:
      "Entry template root `2.16.840.1.113883.10.20.22.4.500` (Care Team Organizer), verified against the C-CDA 2.1 spec.",
    tables: [
      {
        rows: [
          { cda: "code/@displayName", fhir: "CareTeam.name", note: "—" },
          { cda: "statusCode/@code", fhir: "CareTeam.status", note: "—" },
        ],
      },
    ],
  },
  {
    id: "medications-variants",
    title: "Medications Administered / Admission / Discharge Medications → MedicationStatement",
    description:
      "Same field mapping as Medications (see above). Medications Administered reuses the exact same entry template as Medications; Admission/Discharge Medications use their own entry templates.",
    tables: [
      {
        rows: [
          {
            cda: "29549-3 → substanceAdministration[...4.16, same as Medications]",
            fhir: "MedicationStatement[category=inpatient]",
            note: "A real FHIR MedicationStatement-category code",
          },
          {
            cda: "42346-7 → substanceAdministration[...4.36]",
            fhir: "MedicationStatement",
            note: 'category=[{text:"Admission Medication"}] — no coding system exists for this',
          },
          {
            cda: "75311-1 → substanceAdministration[...4.35]",
            fhir: "MedicationStatement",
            note: 'category=[{text:"Discharge Medication"}]',
          },
        ],
      },
    ],
  },
  {
    id: "medical-equipment",
    title: "Medical Equipment (46264-8) → Device",
    description:
      "Entry template root `2.16.840.1.113883.10.20.22.4.50` (Non-Medicinal Supply Activity), verified against the C-CDA 2.1 spec.",
    tables: [
      {
        rows: [
          {
            cda: "participant/participantRole/playingDevice/code",
            fhir: "Device.type",
            note: "—",
          },
          { cda: "statusCode/@code", fhir: "Device.status", note: "—" },
        ],
      },
    ],
  },
  {
    id: "past-medical-history",
    title: "Past Medical History (11348-0) → Condition",
    description:
      "Reuses the Problem Observation entry template (same as the Problems section) — see docs/CCDA_FHIR_MAPPING.md.",
    tables: [
      {
        rows: [
          { cda: "value[@xsi:type=CD]", fhir: "Condition.code", note: "—" },
          { cda: "effectiveTime/low", fhir: "Condition.onsetDateTime", note: "—" },
        ],
      },
    ],
    footnote:
      'Tagged with a text-only category ("Past Medical History" — no coding system exists for this) so the reverse direction can tell it apart from the plain Problems section.',
  },
  {
    id: "planned-procedure-plan-of-treatment",
    title: "Planned Procedure / Plan of Treatment → ServiceRequest[intent=plan]",
    description:
      "Planned Procedure (59772-4) has one entry template. Plan of Treatment (18776-5) fans out into 8 entry templates (Planned Act, Planned Encounter, Planned Immunization Activity, Planned Medication Activity, Planned Observation, Planned Procedure, Planned Supply, Instruction) — HL7 hasn't published a FHIR mapping for any of them.",
    tables: [
      {
        rows: [
          { cda: "code", fhir: "ServiceRequest.code", note: "—" },
          { cda: "statusCode/@code", fhir: "ServiceRequest.status", note: "—" },
          {
            cda: "effectiveTime/@value or low",
            fhir: "ServiceRequest.occurrenceDateTime",
            note: "—",
          },
        ],
      },
    ],
    footnote:
      "Rather than invent 7 unverified FHIR-resource conventions for Plan of Treatment's templates, every entry collapses into one ServiceRequest(intent=plan), tagged category=[{text:\"Plan of Treatment\"}] to distinguish it from Planned Procedure. On the reverse direction, which of the 7 source templates an entry came from isn't preserved — it always rebuilds as a Planned Observation.",
  },
  {
    id: "notes",
    title: "Notes → DocumentReference",
    description:
      "Entry template root `2.16.840.1.113883.10.20.22.4.202` (Note Activity). The section's own code is drawn from a value set, not one fixed LOINC — found by the section's own templateId (`2.16.840.1.113883.10.20.22.2.65`) instead of `findSectionByLoinc`. The one section here with a FHIR mapping confirmed by HL7's own C-CDA-on-FHIR IG.",
    tables: [
      {
        rows: [
          { cda: "code", fhir: "DocumentReference.type", note: "—" },
          { cda: "text", fhir: "DocumentReference.description", note: "—" },
          {
            cda: "effectiveTime/@value or low",
            fhir: "DocumentReference.date",
            note: "—",
          },
        ],
      },
    ],
    footnote:
      'On the reverse direction, the original, more specific note-type code isn\'t preserved — the section rebuilds under the generic "Note" LOINC (34109-9).',
  },
];

const CODE_SYSTEMS: { oid: string; uri: string }[] = [
  { oid: "2.16.840.1.113883.6.1", uri: "http://loinc.org" },
  { oid: "2.16.840.1.113883.6.96", uri: "http://snomed.info/sct" },
  { oid: "2.16.840.1.113883.6.88", uri: "http://www.nlm.nih.gov/research/umls/rxnorm" },
  { oid: "2.16.840.1.113883.6.8", uri: "http://unitsofmeasure.org" },
  { oid: "2.16.840.1.113883.6.90", uri: "http://hl7.org/fhir/sid/icd-10-cm" },
  { oid: "2.16.840.1.113883.6.103", uri: "http://hl7.org/fhir/sid/icd-9-cm" },
  { oid: "2.16.840.1.113883.6.12", uri: "http://www.ama-assn.org/go/cpt" },
  { oid: "2.16.840.1.113883.5.111", uri: "http://terminology.hl7.org/CodeSystem/v3-RoleCode" },
  { oid: "2.16.840.1.113883.12.292", uri: "http://hl7.org/fhir/sid/cvx" },
  { oid: "2.16.840.1.113883.5.1", uri: "http://hl7.org/fhir/administrative-gender" },
  { oid: "2.16.840.1.113883.5.14", uri: "http://terminology.hl7.org/CodeSystem/v3-ActStatus" },
];

function SummaryTable() {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>C-CDA section</th>
            <th>FHIR</th>
            <th>Direction</th>
          </tr>
        </thead>
        <tbody>
          {SUPPORTED_SECTIONS.map((s) => (
            <tr key={s.loinc}>
              <td>
                <code>{s.loinc}</code> {s.label}
              </td>
              <td>{s.fhir}</td>
              <td className="text-muted">both</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FieldTable({ table }: { table: SectionTable }) {
  return (
    <>
      {table.label && (
        <div className="my-2 mt-4 flex items-center gap-2">
          <span className="tag tag-neutral">{table.label}</span>
          {table.labelNote && <span className="text-muted text-xs">{table.labelNote}</span>}
        </div>
      )}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>C-CDA</th>
              <th>FHIR path</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={row.cda}>
                <td>
                  <code>{row.cda}</code>
                </td>
                <td>{row.fhir}</td>
                <td className="text-muted">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function MappingSectionBlock({ section }: { section: MappingSection }) {
  return (
    <>
      <h2 id={section.id} className="mt-8">
        {section.title}
      </h2>
      <p style={muted}>{renderInline(section.description)}</p>
      {section.tables.map((table, i) => (
        <FieldTable key={table.label ?? i} table={table} />
      ))}
      {section.footnote && (
        <p className="mt-2 text-sm" style={muted}>
          {renderInline(section.footnote)}
        </p>
      )}
    </>
  );
}

export function DataMapping() {
  return (
    <div>
      <h1 className="mb-2">Data Mapping &amp; Schemas</h1>
      <p style={muted}>
        Every row below is an explicit, unit-tested code path — the complete list of fields this
        package reads or writes. A field present in the input but absent from these tables is
        reported in <code>warnings[]</code>, never dropped silently.
      </p>
      <p className="text-sm" style={muted}>
        Mappings follow the{" "}
        <a href="http://hl7.org/fhir/us/ccda/" target="_blank" rel="noreferrer">
          C-CDA on FHIR R4 Implementation Guide
        </a>
        . Section extraction is document-type-agnostic — <code>cdaToFhir</code> scans any C-CDA
        document for whichever of the 25 structured sections it contains, each mapping to a discrete
        FHIR resource type.
        <code> fhirToCda</code> always builds a Continuity of Care Document (document-type selection
        isn&apos;t implemented yet).
      </p>
      <p className="text-sm" style={muted}>
        A further 38 narrative-only sections (Chief Complaint, Reason for Visit, History of Present
        Illness, all the hospital-stay and operative-note component sections, and more) map
        generically to <code>Composition.section[]</code> instead of a discrete resource — the C-CDA
        2.1 spec doesn&apos;t mandate structured entries for them, and real-world documents
        essentially never populate them with machine-readable clinical statements. See{" "}
        <code>docs/CCDA_FHIR_MAPPING.md</code> in the repository for the full list of all 38.
      </p>

      <h2 id="supported" className="mt-8">
        Supported sections
      </h2>
      <SummaryTable />

      <FieldTable table={HEADER_TABLE} />

      {MAPPING_SECTIONS.map((section) => (
        <MappingSectionBlock key={section.id} section={section} />
      ))}

      <h2 id="terminology" className="mt-8">
        Code systems
      </h2>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>C-CDA OID</th>
              <th>FHIR URI</th>
            </tr>
          </thead>
          <tbody>
            {CODE_SYSTEMS.map((c) => (
              <tr key={c.oid}>
                <td>
                  <code>{c.oid}</code>
                </td>
                <td className="text-muted">
                  <code>{c.uri}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4" style={muted}>
        Full field-by-field detail is in <code>docs/CCDA_FHIR_MAPPING.md</code> in the repository.
      </p>
    </div>
  );
}
