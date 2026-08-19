# cda-fhir-translator

Monorepo for **`cda-fhir-translator`**, an installable npm package that deterministically
translates HL7 C-CDA 2.1 XML documents to FHIR R4 Bundles and back, following the
[C-CDA on FHIR R4 Implementation Guide](http://hl7.org/fhir/us/ccda/) — plus a CLI and a
browser demo of it.

Translation runs through explicit section mapping tables: same input always produces the
same output, and unmappable content is reported as a structured warning rather than
silently dropped.

**Live demo + docs:** [heyitskundan.github.io/cda-fhir-translator](https://heyitskundan.github.io/cda-fhir-translator/)

**Docs:** [`docs/CCDA_FHIR_MAPPING.md`](./docs/CCDA_FHIR_MAPPING.md) is the field-level
mapping spec.

## Packages

| Path                                                       | What it is                                                                                                              |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| [`packages/core`](./packages/core)                         | **The published package.** `npm install cda-fhir-translator` — library API + CLI. Start here.                           |
| [`client`](./client)                                       | A React/Vite browser demo + docs site. Runs entirely client-side.                                                       |
| [`docs/CCDA_FHIR_MAPPING.md`](./docs/CCDA_FHIR_MAPPING.md) | Field-by-field mapping reference: every C-CDA section this package reads/writes and exactly which FHIR path it maps to. |

## PHI Handling

This tool does not store, log, or transmit Protected Health Information (PHI). It is a
pure processing function: input in, output out, nothing persisted or cached. The caller
is responsible for securing input/output data in transit and at rest. Using this tool
does not by itself make a system HIPAA-compliant — a BAA with your infrastructure
providers is still required. See [`SECURITY.md`](./SECURITY.md) for the full scope.

## What's mapped

Section extraction is document-type-agnostic: `cdaToFhir` scans any C-CDA document for
whichever of the supported sections it contains, and maps the header (Patient,
Practitioner, Organization, Encounter, Composition) regardless of document type.
`Composition.type` reflects the source document's own `ClinicalDocument/code` as-is —
there's no fixed list of "supported document types." `fhirToCda` (the reverse direction)
always builds a Continuity of Care Document — see
[`docs/CCDA_FHIR_MAPPING.md`](./docs/CCDA_FHIR_MAPPING.md) for that limitation and the
Vital Signs grouping caveat.

| Section        | LOINC   |
| -------------- | ------- |
| Allergies      | 48765-2 |
| Medications    | 10160-0 |
| Problems       | 11450-4 |
| Vital Signs    | 8716-3  |
| Results        | 30954-2 |
| Procedures     | 47519-4 |
| Immunizations  | 11369-6 |
| Encounters     | 46240-8 |
| Social History | 29762-2 |
| Family History | 10157-6 |

Each section's entry template root is verified against the C-CDA 2.1 spec — see
[`docs/CCDA_FHIR_MAPPING.md`](./docs/CCDA_FHIR_MAPPING.md) for the field-level detail.

## Using the package

```bash
npm install cda-fhir-translator
```

```ts
import { cdaToFhir, fhirToCda } from "cda-fhir-translator";

const toFhir = cdaToFhir(rawCdaXml);
toFhir.bundle; // FHIR Bundle
toFhir.mappings; // field-level trail
toFhir.warnings; // anything in the input with no mapping

const toCda = fhirToCda(toFhir.bundle);
toCda.xml; // C-CDA XML
```

Or from the command line:

```bash
npx cda-fhir-translator -i patient.xml
npx cda-fhir-translator -i bundle.fhir.json -d fhirToCda
```

See [`packages/core/README.md`](./packages/core/README.md) for the full API and CLI
reference.

## Working on this repo

Requires Node.js 18+.

```bash
git clone https://github.com/heyitskundan/cda-fhir-translator.git
cd cda-fhir-translator
npm install
npm test
npm run build
npm run dev
```

```
packages/core/   the npm package: parser, mapping tables, CLI, tests
client/          browser demo (imports packages/core directly, no backend)
docs/            field-level mapping specification
```

Synthetic C-CDA fixtures used by the tests live in
[`packages/core/test/fixtures/cda`](./packages/core/test/fixtures/cda).

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for how to report a bug, request a new
document type or field, and submit a pull request. Found a security issue? See
[`SECURITY.md`](./SECURITY.md) — report it privately, not as a public issue.

## License

Apache 2.0 — see [LICENSE](./LICENSE).
