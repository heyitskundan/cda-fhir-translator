# Changelog

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
