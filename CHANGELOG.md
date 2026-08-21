# Changelog

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
