import { CodeBlock } from "./CodeBlock.js";

const muted = { opacity: 0.85 };

export function ApiReference() {
  return (
    <div>
      <h1 className="mb-2">API Reference</h1>
      <p style={muted}>
        Every symbol below is exported from the package root —{" "}
        <code>import {"{ X }"} from "cda-fhir-translator"</code>. This is the complete list.
      </p>

      <h2 id="translate" className="mt-8">
        Translation
      </h2>
      <div id="cdaToFhir" className="mb-4">
        <code className="text-sm font-semibold">
          cdaToFhir(cdaXml: string, options?: TranslateOptions): TranslateResult
        </code>
        <p className="mt-2 text-sm" style={muted}>
          Parses a C-CDA 2.1 XML document and maps its header (Patient, Practitioner, Organization,
          Encounter, Composition) plus 25 structured sections and 38 narrative-only sections into a
          FHIR R4 document <code>Bundle</code>. Non-strict mode (default) turns unmappable content
          into a <code>warnings</code> entry; strict mode throws <code>TranslateError</code> on the
          first one.
        </p>
      </div>
      <CodeBlock
        lang="js"
        code={`import { cdaToFhir } from "cda-fhir-translator";

const result = cdaToFhir(rawCdaXml);

result.bundle;    // FHIR R4 Bundle (JSON)
result.mappings;  // [{ cdaPath, fhirPath, resourceType }, ...]
result.warnings;  // [{ path, message }, ...] — content with no known mapping`}
      />

      <div id="fhirToCda" className="mb-6">
        <code className="text-sm font-semibold">
          fhirToCda(bundle: FhirBundle): TranslateToCdaResult
        </code>
        <p className="mt-2 text-sm" style={muted}>
          The reverse direction, for the same sections. Always builds a Continuity of Care Document
          — document-type selection isn&apos;t implemented yet. Doesn&apos;t take a{" "}
          <code>strict</code> option; it always warns and continues.
        </p>
      </div>
      <CodeBlock
        lang="js"
        code={`import { fhirToCda } from "cda-fhir-translator";

const result = fhirToCda(bundle);

result.xml;       // C-CDA XML string
result.mappings;
result.warnings;`}
      />

      <h2 id="types" className="mt-8">
        Result types
      </h2>
      <CodeBlock
        lang="ts"
        code={`interface TranslateOptions {
  strict?: boolean; // throw on unmappable content (default: false)
}

interface TranslateResult {
  bundle: FhirBundle;
  mappings: MappingTraceEntry[];
  warnings: TranslateWarning[];
}

interface TranslateToCdaResult {
  xml: string;
  mappings: MappingTraceEntry[];
  warnings: TranslateWarning[];
}

interface MappingTraceEntry {
  cdaPath: string;
  fhirPath: string;
  resourceType: string;
}

interface TranslateWarning {
  path: string;    // FHIR path or C-CDA path — never a PHI value
  message: string;
}`}
      />

      <h2 id="errors" className="mt-8">
        Errors
      </h2>
      <table className="table mb-4">
        <thead>
          <tr>
            <th>Export</th>
            <th>Extends</th>
            <th>Adds</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>TranslateError</code>
            </td>
            <td className="text-muted">Error</td>
            <td className="text-muted">
              <code>code</code> (PARSE_ERROR | UNSUPPORTED_DOCUMENT_TYPE | MISSING_REQUIRED_SECTION
              | UNMAPPABLE_CODE | INVALID_DATE), <code>path</code> (XPath-like location — never a
              PHI value), <code>cause?</code>
            </td>
          </tr>
        </tbody>
      </table>
      <CodeBlock
        lang="js"
        code={`import { cdaToFhir, TranslateError } from "cda-fhir-translator";

try {
  cdaToFhir(rawCdaXml, { strict: true });
} catch (err) {
  if (err instanceof TranslateError) {
    console.error(err.code, err.path, err.message);
  } else {
    throw err;
  }
}`}
      />

      <h2 id="cli" className="mt-8">
        CLI reference
      </h2>
      <p style={muted}>
        Installing the package also installs a <code>cda-fhir-translator</code> binary.
      </p>
      <table className="table mb-4">
        <thead>
          <tr>
            <th>Flag</th>
            <th>Short</th>
            <th>Meaning</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>--in &lt;file&gt;</code>
            </td>
            <td className="text-muted">-i</td>
            <td className="text-muted">Input file. Reads stdin if omitted.</td>
          </tr>
          <tr>
            <td>
              <code>--out &lt;file&gt;</code>
            </td>
            <td className="text-muted">-o</td>
            <td className="text-muted">Output file. Writes stdout if omitted.</td>
          </tr>
          <tr>
            <td>
              <code>--direction &lt;dir&gt;</code>
            </td>
            <td className="text-muted">-d</td>
            <td className="text-muted">
              "cdaToFhir" or "fhirToCda". Auto-detected from input shape if omitted.
            </td>
          </tr>
          <tr>
            <td>
              <code>--json</code>
            </td>
            <td className="text-muted">—</td>
            <td className="text-muted">
              Print the full result ({"{ bundle|xml, mappings, warnings }"}) instead of just the
              translated output.
            </td>
          </tr>
          <tr>
            <td>
              <code>--help</code>
            </td>
            <td className="text-muted">-h</td>
            <td className="text-muted">Show usage.</td>
          </tr>
        </tbody>
      </table>
      <CodeBlock
        lang="bash"
        code={`npx cda-fhir-translator -i patient.xml                    # -> FHIR JSON on stdout
npx cda-fhir-translator -i bundle.fhir.json -d fhirToCda   # -> C-CDA XML on stdout
cat patient.xml | npx cda-fhir-translator --json            # direction auto-detected`}
      />
    </div>
  );
}
