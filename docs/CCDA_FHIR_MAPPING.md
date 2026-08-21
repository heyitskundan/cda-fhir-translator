# C-CDA → FHIR mapping reference

Source of truth for what this package maps and how. If the code and this file disagree,
that's a bug — open an issue. See [`CONTRIBUTING.md`](../CONTRIBUTING.md) for how to
propose a change.

## Header

| C-CDA                                                          | FHIR           |
| -------------------------------------------------------------- | -------------- |
| `recordTarget/patientRole`                                     | `Patient`      |
| `author/assignedAuthor`                                        | `Practitioner` |
| `custodian/assignedCustodian/representedCustodianOrganization` | `Organization` |
| `componentOf/encompassingEncounter`                            | `Encounter`    |
| `ClinicalDocument` (code/effectiveTime/confidentialityCode)    | `Composition`  |

Patient detail: `id[@root=2.16.840.1.113883.4.1]` → `Patient.identifier` with system
`http://hl7.org/fhir/sid/us-ssn`; any other `id` → `Patient.identifier` with system
`urn:oid:<root>`. `administrativeGenderCode` M/F/UN → `male`/`female`/`unknown`.
`birthTime` → `Patient.birthDate` (date only, time truncated).

## CDA → FHIR sections (entry templates verified against the C-CDA 2.1 spec)

| Section        | LOINC   | Entry template root                                                 | FHIR                                   |
| -------------- | ------- | ------------------------------------------------------------------- | -------------------------------------- |
| Allergies      | 48765-2 | `2.16.840.1.113883.10.20.22.4.30` (Allergy Concern Act)             | `AllergyIntolerance`                   |
| Medications    | 10160-0 | `2.16.840.1.113883.10.20.22.4.16` (Medication Activity)             | `MedicationStatement`                  |
| Problems       | 11450-4 | `2.16.840.1.113883.10.20.22.4.4` (Problem Observation)              | `Condition`                            |
| Results        | 30954-2 | `2.16.840.1.113883.10.20.22.4.1` (Result Organizer)                 | `DiagnosticReport` + `Observation[]`   |
| Vital Signs    | 8716-3  | `2.16.840.1.113883.10.20.22.4.1` (same organizer template)          | `Observation[category=vital-signs]`    |
| Procedures     | 47519-4 | `2.16.840.1.113883.10.20.22.4.14` (Procedure Activity Procedure V2) | `Procedure`                            |
| Immunizations  | 11369-6 | `2.16.840.1.113883.10.20.22.4.52` (Immunization Activity V3)        | `Immunization`                         |
| Encounters     | 46240-8 | `2.16.840.1.113883.10.20.22.4.49` (Encounter Activity V3)           | `Encounter`                            |
| Social History | 29762-2 | `2.16.840.1.113883.10.20.22.4.78` (Smoking Status Observation)      | `Observation[category=social-history]` |
| Family History | 10157-6 | `2.16.840.1.113883.10.20.22.4.45` (Family History Organizer V3)     | `FamilyMemberHistory`                  |
| Payers         | 48768-6 | `2.16.840.1.113883.10.20.22.4.60` (Coverage Activity V3)            | `Coverage`                             |

Field-level detail:

- **Allergies**: allergen code from
  `observation/participant/participantRole/playingEntity/code`;
  `act/statusCode/@code=active` → `clinicalStatus`; `act/effectiveTime/low` → `onsetDateTime`;
  nested observation's `value[@xsi:type=CD]` → `reaction[].manifestation[]`.
- **Medications**: `consumable/.../manufacturedMaterial/code` → `medicationCodeableConcept`
  (RxNorm preferred); `doseQuantity` → `dosage[].doseAndRate[].doseQuantity`; `routeCode`
  → `dosage[].route`; `statusCode/@code` → `status`.
- **Problems**: `value[@xsi:type=CD]` → `code` (SNOMED or ICD-10); `effectiveTime/low`
  → `onsetDateTime`; `effectiveTime/high` → `abatementDateTime`.
- **Results / Vital Signs**: organizer `code` → `DiagnosticReport.code` (Results only);
  each `component/observation` → its own `Observation`, `value[@xsi:type=PQ]` →
  `valueQuantity`, `value[@xsi:type=CD]` → `valueCodeableConcept`, `interpretationCode`
  → `interpretation`.
- **Procedures**: `procedure/code` → `code` (CPT-4 or SNOMED); `procedure/statusCode/@code`
  → `status` (`completed`/`active`/`aborted`/`cancelled`/`held` → `completed`/`in-progress`/
  `stopped`/`not-done`/`on-hold`, unrecognized or missing → `unknown`);
  `procedure/effectiveTime/@value` or `effectiveTime/low` → `performedDateTime`.
- **Immunizations**: `consumable/.../manufacturedMaterial/code` → `vaccineCode` (CVX);
  `statusCode/@code` → `status` (`completed`/`aborted`/`cancelled` →
  `completed`/`not-done`/`not-done`, unrecognized or missing → `completed`);
  `effectiveTime/@value` or `effectiveTime/low` → `occurrenceDateTime`.
- **Encounters**: `code` → `class` (a `Coding`, not a `CodeableConcept`); `statusCode/@code`
  → `status` (`completed`/`active` → `finished`/`in-progress`, unrecognized or missing →
  `unknown`); `effectiveTime/@value` or `low`/`high` → `period.start`/`period.end`. Distinct
  from the header's `componentOf/encompassingEncounter` (single document-level encounter).
- **Social History**: covers Smoking Status only (not the full Social History section).
  `code` → `code`; `value[@xsi:type=CD]` → `valueCodeableConcept`; `effectiveTime/@value`
  or `low` → `effectiveDateTime`. Not organizer-grouped — each observation is its own entry.
- **Family History**: `subject/relatedSubject/code` → `relationship`; each nested Family
  History Observation's `value[@xsi:type=CD]` → one `condition[].code` entry. One organizer
  produces one `FamilyMemberHistory` with zero or more conditions.
- **Payers**: `statusCode/@code` → `status` (`completed`/`active` → `active`,
  `aborted`/`cancelled` → `cancelled`, unrecognized or missing → `active`); nested Policy
  Activity's `code` → `type`; `.../representedOrganization/name` → `payor[].display`
  (display-only — no `Organization` resource is created).

## FHIR → CDA (reverse direction)

`fhirToCda` builds the same 11 sections and header back into C-CDA XML — the tables above
apply in reverse, field for field. Three differences from a strict inverse:

- **Document type is fixed.** `fhirToCda` always builds a Continuity of Care Document
  (`code` `34133-9`), regardless of what `Composition.type` the input Bundle has.
  Building other document types needs a `documentType` option that isn't implemented yet.
- **Vital Signs grouping isn't recoverable.** `cdaToFhir` preserves each source
  `<organizer>` as a separate group; that grouping isn't carried on the FHIR
  `Observation` resources (only `category=vital-signs` is). `fhirToCda` groups all
  vital-signs Observations into a single organizer — coded data round-trips, the
  original grouping doesn't.
- **The header's Encounter and the Encounters section share a FHIR resource type.**
  `fhirToCda` treats the first `Encounter` resource in the input Bundle as the document's
  `componentOf/encompassingEncounter` and excludes it from the Encounters section, so it
  isn't built twice. Any additional `Encounter` resources become Encounters-section entries.

See [`test/roundtrip.test.ts`](../packages/core/test/roundtrip.test.ts) for what a
CDA → FHIR → CDA roundtrip is expected to preserve.

## Code systems

See [`src/shared/code-systems.ts`](../packages/core/src/shared/code-systems.ts) for the
full OID ↔ URI table (LOINC, SNOMED CT, RxNorm, UCUM, ICD-10-CM, ICD-9-CM, CVX,
administrative-gender, v3-ActStatus).

## Adding a new section or field

1. Cite the C-CDA template/field and the FHIR path it maps to (a sample document helps).
2. Add or update the row in this file in the same PR as the code change.
3. Add a table-driven test in `packages/core/test/sections/` using a synthetic snippet —
   see any existing `*.test.ts` in that directory for the pattern.
