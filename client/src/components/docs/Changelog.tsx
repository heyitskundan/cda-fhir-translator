export function Changelog() {
  return (
    <div>
      <h1 className="mb-2">Changelog</h1>
      <p className="mb-8" style={{ opacity: 0.85 }}>
        v1.0.0 is the first stable release — the public API (<code>cdaToFhir</code>,{" "}
        <code>fhirToCda</code>, and the shape of their results) is considered stable from here. See{" "}
        <code>CHANGELOG.md</code> in the repo for the source of this page.
      </p>

      <div className="flex flex-col gap-6">
        <div id="v1-0-0" className="border-t pt-3" style={{ borderColor: "var(--color-divider)" }}>
          <div className="mb-2 flex items-baseline gap-3">
            <h3 className="m-0">v1.0.0</h3>
            <span className="text-muted text-sm">current release</span>
          </div>
          <div className="mb-2 flex gap-2">
            <span className="tag tag-accent">Added</span>
          </div>
          <ul className="m-0 flex list-disc flex-col gap-1 pl-5" style={{ opacity: 0.85 }}>
            <li>
              Full C-CDA 2.1 section coverage: 14 more structured sections (Advance Directives,
              Functional Status, Mental Status, Goals, Health Concerns, Health Status Evaluations
              and Outcomes, Care Teams, Medications Administered, Admission/Discharge Medications,
              Medical Equipment, Past Medical History, Planned Procedure, Plan of Treatment, Notes)
              — 25 structured sections total, each mapping to a discrete FHIR resource type
            </li>
            <li>
              38 narrative-only sections (Chief Complaint, Reason for Visit, History of Present
              Illness, and more) map generically to <code>Composition.section[]</code> — see{" "}
              <code>src/shared/narrative-sections.ts</code> for the full list
            </li>
            <li>
              New types: <code>Device</code>, <code>DocumentReference</code>. Extended{" "}
              <code>MedicationStatement</code>, <code>Condition</code>, and{" "}
              <code>ServiceRequest</code> with an optional <code>category</code> field so sections
              sharing a FHIR resource type with an existing section (e.g. Medications Administered
              and Medications both produce <code>MedicationStatement</code>) round-trip without
              colliding
            </li>
            <li>
              Plan of Treatment collapses 7 different C-CDA entry templates into one{" "}
              <code>ServiceRequest(intent=plan)</code> — HL7 hasn&apos;t published a FHIR mapping
              for any of them, so this is a documented simplification, not an IG-confirmed mapping
            </li>
          </ul>
        </div>
        <div id="v0-3-0" className="border-t pt-3" style={{ borderColor: "var(--color-divider)" }}>
          <div className="mb-2 flex items-baseline gap-3">
            <h3 className="m-0">v0.3.0</h3>
          </div>
          <div className="mb-2 flex gap-2">
            <span className="tag tag-accent">Added</span>
          </div>
          <ul className="m-0 flex list-disc flex-col gap-1 pl-5" style={{ opacity: 0.85 }}>
            <li>
              Payers / Insurance (48768-6), both directions — 11 sections total, maps to a new{" "}
              <code>Coverage</code> type
            </li>
            <li>
              The nested Policy Activity&apos;s <code>code</code> maps to <code>Coverage.type</code>
              , and its represented organization name maps to <code>Coverage.payor[].display</code>{" "}
              (display-only — no <code>Organization</code> resource is created)
            </li>
          </ul>
        </div>
        <div id="v0-2-0" className="border-t pt-3" style={{ borderColor: "var(--color-divider)" }}>
          <div className="mb-2 flex items-baseline gap-3">
            <h3 className="m-0">v0.2.0</h3>
          </div>
          <div className="mb-2 flex gap-2">
            <span className="tag tag-accent">Added</span>
          </div>
          <ul className="m-0 flex list-disc flex-col gap-1 pl-5" style={{ opacity: 0.85 }}>
            <li>
              4 new sections in both directions: Procedures (47519-4), Immunizations (11369-6),
              Encounters (46240-8), and Social History / Smoking Status (29762-2) — 10 sections
              total, each entry template root verified against the C-CDA 2.1 spec
            </li>
            <li>
              Family History (10157-6) maps to a new <code>FamilyMemberHistory</code> type — one
              resource per Family History Organizer, with a condition entry per nested observation
            </li>
            <li>
              Added CPT-4 and HL7 RoleCode to the code system table, used by Procedures and Family
              History respectively
            </li>
            <li>
              The Encounters section and the header&apos;s encounter both map to FHIR{" "}
              <code>Encounter</code>; <code>fhirToCda</code> now distinguishes them so a document
              with both doesn&apos;t produce a duplicate
            </li>
          </ul>
        </div>
        <div id="v0-1-0" className="border-t pt-3" style={{ borderColor: "var(--color-divider)" }}>
          <div className="mb-2 flex items-baseline gap-3">
            <h3 className="m-0">v0.1.0</h3>
          </div>
          <div className="mb-2 flex gap-2">
            <span className="tag tag-accent">Added</span>
          </div>
          <ul className="m-0 flex list-disc flex-col gap-1 pl-5" style={{ opacity: 0.85 }}>
            <li>
              <code>cdaToFhir(cdaXml, options)</code>: parses a C-CDA 2.1 XML document and maps its
              header (Patient, Practitioner, Organization, Encounter, Composition) plus 5 sections
              (Allergies, Medications, Problems, Vital Signs, Results) into a FHIR R4 document
              Bundle, with a field-level mapping trail and structured warnings for unmappable
              content
            </li>
            <li>Each section's entry template root is verified against the C-CDA 2.1 spec</li>
            <li>
              <code>fhirToCda(bundle)</code>: the reverse direction, for the same 5 sections. Always
              builds a Continuity of Care Document; Vital Signs grouping isn&apos;t recoverable
              across a roundtrip (coded data is)
            </li>
            <li>
              CLI (<code>cda-fhir-translator</code>): both directions, auto-detects direction from
              input shape, reads from stdin/file, writes to stdout/file, <code>--json</code> for the
              full result
            </li>
            <li>
              Browser demo: translate, view the mapping trail, and see warnings, entirely
              client-side
            </li>
            <li>
              Zero runtime dependencies beyond fast-xml-parser. No persistence, no network I/O
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
