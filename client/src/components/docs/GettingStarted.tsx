import { CodeBlock } from "./CodeBlock.js";

export function GettingStarted({ goDataMapping }: { goDataMapping: () => void }) {
  return (
    <div>
      <h1 id="top" className="mb-2">
        Getting Started
      </h1>
      <p style={{ opacity: 0.85 }}>
        cda-fhir-translator deterministically translates HL7 C-CDA 2.1 XML documents to FHIR R4, and
        back, through explicit section mapping tables. Every output value traces back to a specific
        C-CDA field or FHIR path. It is open source, Apache-2.0-licensed.
      </p>

      <h2 id="overview" className="mt-8">
        Overview
      </h2>
      <p style={{ opacity: 0.85 }}>
        Translation is a pure function: the same input always produces the same output. There is no
        network I/O and no persistence — the library parses a string and returns a string. It ships
        as both an ESM and a CommonJS package, runs in Node.js 18+ or any modern browser, and is
        covered by 182 unit tests across the parser, header mapping, all 25 structured section
        mappings in both directions, the CLI, and a CDA → FHIR → CDA roundtrip.
      </p>

      <h2 id="installation" className="mt-8">
        Installation
      </h2>
      <CodeBlock lang="bash" code="npm install cda-fhir-translator" />

      <h2 id="quickstart" className="mt-8">
        Quick start
      </h2>
      <p style={{ opacity: 0.85 }}>
        Translating a C-CDA document into a FHIR <code>Patient</code> +{" "}
        <code>AllergyIntolerance</code> Bundle:
      </p>
      <CodeBlock
        lang="js"
        code={`import { cdaToFhir } from "cda-fhir-translator";

const result = cdaToFhir(rawCdaXml);

result.bundle;    // FHIR R4 Bundle (JSON)
result.mappings;  // [{ cdaPath, fhirPath, resourceType }, ...]
result.warnings;  // content in the input with no known mapping`}
      />
      <p style={{ opacity: 0.85 }}>And back, from a FHIR Bundle to C-CDA XML:</p>
      <CodeBlock
        lang="js"
        code={`import { fhirToCda } from "cda-fhir-translator";

const result = fhirToCda(bundle);

result.xml;       // C-CDA XML string
result.mappings;
result.warnings;`}
      />
      <p style={{ opacity: 0.85 }}>
        Both module systems work the same way — <code>require("cda-fhir-translator")</code> needs no
        config.
      </p>

      <h2 id="phi" className="mt-8">
        Handling PHI
      </h2>
      <div className="blueprint flex gap-3 p-4">
        <i className="corner tl" />
        <i className="corner tr" />
        <i className="corner bl" />
        <i className="corner br" />
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flex: "none", marginTop: 2 }}
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        </svg>
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="tag tag-accent">PHI</span>
            <strong style={{ fontFamily: "var(--font-heading)", fontSize: 15 }}>
              The library never sends data anywhere
            </strong>
          </div>
          <p className="mb-2 text-sm" style={{ opacity: 0.85 }}>
            Both C-CDA and FHIR inputs typically carry PHI (names, birth dates, addresses,
            identifiers — see{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                goDataMapping();
              }}
            >
              Data Mapping
            </a>{" "}
            for exactly which fields). The package performs no network I/O and no persistence: it
            parses the string you pass in and returns a string. PHI never leaves your process.
          </p>
          <p className="text-sm" style={{ opacity: 0.85 }}>
            The application calling it is still responsible for what happens to that string — avoid
            logging raw <code>result.bundle</code>/<code>result.xml</code> or the source document in
            plaintext. If you report a bug, use synthetic input or describe the shape of the data
            rather than pasting real PHI (see{" "}
            <a
              href="https://github.com/heyitskundan/cda-fhir-translator/blob/main/SECURITY.md"
              target="_blank"
              rel="noreferrer"
            >
              <code>SECURITY.md</code>
            </a>
            ).
          </p>
        </div>
      </div>

      <h2 id="requirements" className="mt-8">
        Requirements
      </h2>
      <table className="table">
        <thead>
          <tr>
            <th>Requirement</th>
            <th>Version</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Node.js</td>
            <td>18 or later</td>
            <td className="text-muted">Any modern browser also works when bundled</td>
          </tr>
          <tr>
            <td>Runtime dependencies</td>
            <td>
              <code>fast-xml-parser</code>
            </td>
            <td className="text-muted">
              The only runtime dependency; mapping and CLI are hand-written
            </td>
          </tr>
          <tr>
            <td>TypeScript</td>
            <td>Optional</td>
            <td className="text-muted">Full type defs ship for both ESM and CJS builds</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
