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

| Section                                | LOINC                       | Entry template root                                                                                                       | FHIR                                      |
| -------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Allergies                              | 48765-2                     | `2.16.840.1.113883.10.20.22.4.30` (Allergy Concern Act)                                                                   | `AllergyIntolerance`                      |
| Medications                            | 10160-0                     | `2.16.840.1.113883.10.20.22.4.16` (Medication Activity)                                                                   | `MedicationStatement`                     |
| Problems                               | 11450-4                     | `2.16.840.1.113883.10.20.22.4.4` (Problem Observation)                                                                    | `Condition`                               |
| Results                                | 30954-2                     | `2.16.840.1.113883.10.20.22.4.1` (Result Organizer)                                                                       | `DiagnosticReport` + `Observation[]`      |
| Vital Signs                            | 8716-3                      | `2.16.840.1.113883.10.20.22.4.1` (same organizer template)                                                                | `Observation[category=vital-signs]`       |
| Procedures                             | 47519-4                     | `2.16.840.1.113883.10.20.22.4.14` (Procedure Activity Procedure V2)                                                       | `Procedure`                               |
| Immunizations                          | 11369-6                     | `2.16.840.1.113883.10.20.22.4.52` (Immunization Activity V3)                                                              | `Immunization`                            |
| Encounters                             | 46240-8                     | `2.16.840.1.113883.10.20.22.4.49` (Encounter Activity V3)                                                                 | `Encounter`                               |
| Social History                         | 29762-2                     | `2.16.840.1.113883.10.20.22.4.78` (Smoking Status Observation)                                                            | `Observation[category=social-history]`    |
| Family History                         | 10157-6                     | `2.16.840.1.113883.10.20.22.4.45` (Family History Organizer V3)                                                           | `FamilyMemberHistory`                     |
| Payers                                 | 48768-6                     | `2.16.840.1.113883.10.20.22.4.60` (Coverage Activity V3)                                                                  | `Coverage`                                |
| Advance Directives                     | 42348-3                     | `2.16.840.1.113883.10.20.22.4.48` (Advance Directive Observation)                                                         | `Consent`                                 |
| Functional Status                      | 47420-5                     | `2.16.840.1.113883.10.20.22.4.67` (Functional Status Observation)                                                         | `Observation[category=functional-status]` |
| Mental Status                          | 10190-7                     | `2.16.840.1.113883.10.20.22.4.74` (Mental Status Observation)                                                             | `Observation[category=mental-status]`     |
| Goals                                  | 61146-7                     | `2.16.840.1.113883.10.20.22.4.121` (Goal Observation)                                                                     | `Goal`                                    |
| Health Concerns                        | 75310-3                     | `2.16.840.1.113883.10.20.22.4.132` (Health Concern Act)                                                                   | `Condition[category=health-concern]`      |
| Health Status Evaluations and Outcomes | 11383-7                     | `...4.144` (Outcome Observation) and `...4.110` (Progress Toward Goal Observation)                                        | `Observation[category=health-status]`     |
| Care Teams                             | 85847-2                     | `2.16.840.1.113883.10.20.22.4.500` (Care Team Organizer)                                                                  | `CareTeam`                                |
| Medications Administered               | 29549-3                     | `2.16.840.1.113883.10.20.22.4.16` (same as Medications)                                                                   | `MedicationStatement[category=inpatient]` |
| Admission Medications                  | 42346-7                     | `2.16.840.1.113883.10.20.22.4.36` (Admission Medication)                                                                  | `MedicationStatement`                     |
| Discharge Medications                  | 75311-1                     | `2.16.840.1.113883.10.20.22.4.35` (Discharge Medication)                                                                  | `MedicationStatement`                     |
| Medical Equipment                      | 46264-8                     | `2.16.840.1.113883.10.20.22.4.50` (Non-Medicinal Supply Activity)                                                         | `Device`                                  |
| Past Medical History                   | 11348-0                     | `2.16.840.1.113883.10.20.22.4.4` (same as Problems)                                                                       | `Condition`                               |
| Planned Procedure                      | 59772-4                     | `2.16.840.1.113883.10.20.22.4.41` (Planned Procedure)                                                                     | `ServiceRequest[intent=plan]`             |
| Plan of Treatment                      | 18776-5                     | 8 "Planned *" / Instruction templates — see field detail below                                                            | `ServiceRequest[intent=plan]`             |
| Notes                                  | (value set, no fixed LOINC) | `2.16.840.1.113883.10.20.22.4.202` (Note Activity), section found by its own templateId `2.16.840.1.113883.10.20.22.2.65` | `DocumentReference`                       |

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
- **Advance Directives**: `code` → `category`; `statusCode/@code` → `status`.
- **Functional Status / Mental Status / Health Status Evaluations and Outcomes**: same
  field mapping as Results' `component/observation` (see above), tagged with a
  category that's this package's own convention (`functional-status`, `mental-status`,
  `health-status`), not one drawn from the C-CDA-on-FHIR IG.
- **Goals**: `code` → `description`; `statusCode/@code` → `lifecycleStatus`.
- **Health Concerns**: `code` → `code`; `effectiveTime/low` → `onsetDateTime`; always
  tagged `category=health-concern` (the real US Core condition-category code) so the
  reverse direction can tell it apart from the plain Problems section.
- **Care Teams**: `code/@displayName` → `name`; `statusCode/@code` → `status`.
- **Medications Administered / Admission Medications / Discharge Medications**: same
  field mapping as Medications (see above). Medications Administered reuses the exact
  same entry template as Medications and is tagged `category=inpatient` (a real FHIR
  MedicationStatement-category code) to distinguish it on the reverse direction.
  Admission/Discharge Medications use their own entry templates and are tagged with a
  text-only category (`"Admission Medication"` / `"Discharge Medication"` — no coding
  system exists for these, so no code is asserted).
- **Medical Equipment**: `participant/participantRole/playingDevice/code` → `type`;
  `statusCode/@code` → `status`.
- **Past Medical History**: same field mapping as Problems (see above) — reuses the
  same Problem Observation entry template, tagged with a text-only category
  (`"Past Medical History"`) to distinguish it on the reverse direction.
- **Planned Procedure**: `code` → `code`; `statusCode/@code` → `status`;
  `effectiveTime/@value` or `low` → `occurrenceDateTime`.
- **Plan of Treatment**: HL7 hasn't published a FHIR mapping for any of its 7 entry
  templates (Planned Act, Planned Encounter, Planned Immunization Activity, Planned
  Medication Activity, Planned Observation, Planned Procedure, Planned Supply) or for
  Instruction, and each would plausibly map to a different FHIR resource. Rather than
  invent 7 unverified conventions, every entry collapses into one
  `ServiceRequest(intent=plan)`, tagged `category=[{text:"Plan of Treatment"}]` to
  distinguish it from the (separately-sectioned) Planned Procedure. "Planned Coverage"
  (`...4.129`) is excluded — it's C-CDA 3.0-ballot content, not confirmed as part of
  2.1.
- **Notes**: the section's own `code` is drawn from a value set, not one fixed LOINC —
  found by the section's `templateId` instead of `findSectionByLoinc`. `code` → `type`;
  `text` → `description`; `effectiveTime/@value` or `low` → `date`.

## Narrative-only sections

38 additional C-CDA 2.1 sections carry narrative text only — the spec doesn't mandate
structured entries for them, and real-world documents essentially never populate them
with machine-readable clinical statements (Chief Complaint, Reason for Visit, History
of Present Illness, Review of Systems, Assessment, Assessment and Plan, Instructions,
all the hospital-stay and operative-note component sections, and more — see
[`src/shared/narrative-sections.ts`](../packages/core/src/shared/narrative-sections.ts)
for the full list of 38 with LOINC codes and template OIDs).

These map generically to `Composition.section[]` — `section/code` → `code`,
`section/title` → `title`, and a flattened `section/text` → `text` (mixed-content
markup like tables and lists isn't preserved on a roundtrip, only its text content, in
the order `fast-xml-parser` yields child nodes — which isn't guaranteed to match
source document order for interleaved text and elements). One handler
(`cda-to-fhir/sections/narrative.ts` / `fhir-to-cda/sections/narrative.ts`) covers all
38, rather than one file per section, since there's no structured-entry logic to write
per section.

"Course of Care Section" (`2.16.840.1.113883.10.20.22.2.64`) is deliberately excluded
— its LOINC code couldn't be independently distinguished from Hospital Course
Section's during research, and this package doesn't ship an OID it can't verify.

## FHIR → CDA (reverse direction)

`fhirToCda` builds the same sections and header back into C-CDA XML — the tables above
apply in reverse, field for field. Differences from a strict inverse:

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
- **Health Status Evaluations and Outcomes** always rebuilds as an Outcome Observation —
  which of its two source entry templates a given Observation came from isn't preserved.
- **Plan of Treatment** always rebuilds as a Planned Observation — which of its 7 source
  entry templates a given ServiceRequest came from isn't preserved.
- **Notes** rebuilds its section under the generic "Note" LOINC (`34109-9`) — the
  original, more specific note-type code isn't preserved on `DocumentReference`.

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
