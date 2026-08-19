# cda-fhir-translator

Deterministic HL7 C-CDA 2.1 XML ⇄ FHIR R4 Bundle translator with a field-level mapping
trail, plus a CLI. Zero-persistence, PHI-safe by design — see the root
[`SECURITY.md`](../../SECURITY.md) for the PHI handling policy.

## Install

```bash
npm install cda-fhir-translator
```

## Quick start

```ts
import { cdaToFhir, fhirToCda } from "cda-fhir-translator";

const toFhir = cdaToFhir(rawCdaXml);
toFhir.bundle; // FHIR Bundle (JSON)
toFhir.mappings; // [{ cdaPath, fhirPath, resourceType }, ...]
toFhir.warnings; // content in the input with no known mapping

const toCda = fhirToCda(toFhir.bundle);
toCda.xml; // C-CDA XML string
toCda.mappings;
toCda.warnings;
```

## API reference

```ts
function cdaToFhir(cdaXml: string, options?: TranslateOptions): TranslateResult;

interface TranslateOptions {
  strict?: boolean; // throw on unmappable content (default: false)
}

interface TranslateResult {
  bundle: FhirBundle;
  mappings: MappingTraceEntry[];
  warnings: TranslateWarning[];
}

function fhirToCda(bundle: FhirBundle): TranslateToCdaResult;

interface TranslateToCdaResult {
  xml: string;
  mappings: MappingTraceEntry[];
  warnings: TranslateWarning[];
}
```

`fhirToCda` always builds a Continuity of Care Document (document-type selection isn't
implemented yet) — see [`../../docs/CCDA_FHIR_MAPPING.md`](../../docs/CCDA_FHIR_MAPPING.md)
for that and the Vital Signs grouping caveat.

### Errors

```ts
class TranslateError extends Error {
  readonly code: TranslateErrorCode; // PARSE_ERROR | UNSUPPORTED_DOCUMENT_TYPE | ...
  readonly path: string; // XPath-like location — never a PHI value
  readonly cause?: Error;
}
```

`cdaToFhir`'s non-strict mode (default) turns unmappable content into a `warnings` entry
instead of throwing; strict mode throws `TranslateError` on the first one. `fhirToCda`
doesn't take a `strict` option — it always warns and continues.

## CLI

```bash
npx cda-fhir-translator -i patient.xml                     # C-CDA -> FHIR, direction auto-detected
npx cda-fhir-translator -i bundle.fhir.json -d fhirToCda    # FHIR -> C-CDA
npx cda-fhir-translator -i patient.xml --json                # full result, not just the translated output
npx cda-fhir-translator -i patient.xml -o bundle.json         # write to a file instead of stdout
cat patient.xml | npx cda-fhir-translator                     # read from stdin
npx cda-fhir-translator --help
```

Direction is auto-detected from the input's shape (`<` → C-CDA XML, `{` → FHIR JSON) when
`-d`/`--direction` is omitted. Warnings print to stderr; the translated output goes to
stdout (or `-o`).

## Supported sections

See [`../../docs/CCDA_FHIR_MAPPING.md`](../../docs/CCDA_FHIR_MAPPING.md) for the
field-level mapping table.

## Contributing

See the root [`CONTRIBUTING.md`](../../CONTRIBUTING.md).

## License

Apache 2.0 — see [`../../LICENSE`](../../LICENSE).
