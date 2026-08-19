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
];

const CODE_SYSTEMS: { oid: string; uri: string }[] = [
  { oid: "2.16.840.1.113883.6.1", uri: "http://loinc.org" },
  { oid: "2.16.840.1.113883.6.96", uri: "http://snomed.info/sct" },
  { oid: "2.16.840.1.113883.6.88", uri: "http://www.nlm.nih.gov/research/umls/rxnorm" },
  { oid: "2.16.840.1.113883.6.8", uri: "http://unitsofmeasure.org" },
  { oid: "2.16.840.1.113883.6.90", uri: "http://hl7.org/fhir/sid/icd-10-cm" },
  { oid: "2.16.840.1.113883.6.103", uri: "http://hl7.org/fhir/sid/icd-9-cm" },
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
        document for whichever of the 5 supported sections it contains.
        <code> fhirToCda</code> always builds a Continuity of Care Document (document-type selection
        isn&apos;t implemented yet).
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
