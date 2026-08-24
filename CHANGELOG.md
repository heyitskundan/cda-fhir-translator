# Changelog

## v1.0.0

First stable release. The public API (`cdaToFhir`, `fhirToCda`, and the shape of their
`TranslateResult`/`TranslateToCdaResult`) is considered stable from here — it hasn't
changed across 0.1.0 → 0.3.0, only grown additively.

- Full C-CDA 2.1 section coverage. 15 more structured sections, both directions:
  Advance Directives (42348-3), Functional Status (47420-5), Mental Status (10190-7),
  Goals (61146-7), Health Concerns (75310-3), Health Status Evaluations and Outcomes
  (11383-7), Care Teams (85847-2), Medications Administered (29549-3), Admission
  Medications (42346-7), Discharge Medications (75311-1), Medical Equipment (46264-8),
  Past Medical History (11348-0), Planned Procedure (59772-4), Plan of Treatment
  (18776-5), and Notes (section code drawn from a value set, not one fixed LOINC). 26
  structured sections total, each mapping to a discrete FHIR resource type.
- 39 additional narrative-only sections (Chief Complaint, Reason for Visit, History of
  Present Illness, Review of Systems, all the hospital-stay and operative-note
  component sections, and more) map generically to `Composition.section[]` — see
  `src/shared/narrative-sections.ts` for the full list. One section (`Course of Care
Section`) is deliberately excluded — its LOINC code couldn't be independently
  verified during research, and this package doesn't ship an OID it can't verify.
- New types: `Device`, `DocumentReference`. Extended `MedicationStatement`,
  `Condition`, and `ServiceRequest` with an optional `category` field, so sections that
  share a FHIR resource type with an existing section (Medications Administered /
  Admission Medications / Discharge Medications vs. Medications; Health Concerns /
  Past Medical History vs. Problems; Plan of Treatment vs. Planned Procedure) round-trip
  without colliding — see `docs/CCDA_FHIR_MAPPING.md`.
- Plan of Treatment collapses 7 different C-CDA entry templates (Planned Act, Planned
  Encounter, Planned Immunization Activity, Planned Medication Activity, Planned
  Observation, Planned Procedure, Planned Supply) plus Instruction into one
  `ServiceRequest(intent=plan)` — HL7 hasn't published a FHIR mapping for any of them,
  so this is a documented simplification, not an IG-confirmed mapping.

## v0.3.0

- `cdaToFhir`/`fhirToCda`: Payers/Insurance (48768-6), both directions. Maps to a new
  `Coverage` type — `statusCode` → `status`, the nested Policy Activity's `code` →
  `type`, and its `representedOrganization/name` → `payor[].display` (display-only, no
  `Organization` resource is created). 11 sections total.

## v0.2.0

- `cdaToFhir`/`fhirToCda`: 4 new sections, both directions — Procedures (47519-4),
  Immunizations (11369-6), Encounters (46240-8), and Social History/Smoking Status
  (29762-2). Each section's entry template root is verified against the C-CDA 2.1 spec,
  same as v0.1.0's sections. 10 sections total.
- Family History (10157-6) maps to a new `FamilyMemberHistory` type — one resource per
  Family History Organizer, with a `condition[]` entry per nested Family History
  Observation.
- Added CPT-4 (`2.16.840.1.113883.6.12`) and HL7 RoleCode (`2.16.840.1.113883.5.111`)
  to the code system table, used by Procedures and Family History respectively.
- The Encounters section and the header's `componentOf/encompassingEncounter` both map
  to FHIR `Encounter`; `fhirToCda` now distinguishes them so a document with both
  doesn't produce a duplicate encounter — see `docs/CCDA_FHIR_MAPPING.md`.

## v0.1.0

- `cdaToFhir(cdaXml, options)`: parses a C-CDA 2.1 XML document and maps its header
  (Patient, Practitioner, Organization, Encounter, Composition) plus 5 sections
  (Allergies, Medications, Problems, Vital Signs, Results) into a FHIR R4 document
  Bundle, with a field-level mapping trail and structured warnings for unmappable
  content. Each section's entry template root is verified against the C-CDA 2.1 spec.
- `fhirToCda(bundle)`: the reverse direction, for the same 5 sections. Always builds a
  Continuity of Care Document; Vital Signs grouping isn't recoverable across a roundtrip
  (coded data is) — see `docs/CCDA_FHIR_MAPPING.md`.
- CLI (`cda-fhir-translator`): both directions, auto-detects direction from input shape,
  reads from stdin/file, writes to stdout/file, `--json` for the full result.
- Browser demo (`client/`): paste C-CDA XML or a FHIR Bundle, see the translated output,
  mapping trail, and warnings, entirely client-side.
- Zero runtime dependencies beyond `fast-xml-parser`. No persistence, no network I/O.
