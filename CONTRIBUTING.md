# Contributing

## PHI — read this first

This project's test fixtures, issues, and PRs must **never** contain real patient data.
Use synthetic data only (hand-crafted or [Synthea](https://github.com/synthetichealth/synthea)-generated).
Every fixture file must start with `<!-- SYNTHETIC DATA ONLY — NOT REAL PHI -->`. A
pre-commit hook scans staged files for SSN/MRN-shaped patterns and blocks the commit if
found — it's a safety net, not a substitute for checking your own diff.

## Reporting a bug

Open an issue on this repository's Issues tab. Include:

- **The input** — synthetic C-CDA XML or FHIR JSON — and the direction
  (`cdaToFhir` / `fhirToCda`).
- **What you expected** vs. **what you got** — the output, or the exact error and its
  `.path` (never paste the value at that path if it's a PHI field).
- **How you're running it** — package version (`npm ls cda-fhir-translator`), Node.js
  version, library API or CLI.

## Requesting a feature

- **A new document type** — open an issue naming the LOINC document code and, ideally, a
  synthetic sample document, before starting work.
- **A field within an already-supported section** — name the C-CDA element/template and
  the FHIR path it should map to.

## Development setup

```bash
git clone https://github.com/heyitskundan/cda-fhir-translator.git
cd cda-fhir-translator
npm install
npm test               # packages/core (parser, header, section mappings, CLI, roundtrip) + client
npm run build           # packages/core (dual ESM+CJS via tsup) + client
npm run dev              # browser demo at http://localhost:5173
```

```
packages/core/   the npm package itself — start here for library/CLI changes
client/          browser demo, imports packages/core directly
docs/            field-level mapping specification
```

Synthetic C-CDA fixtures used by the tests live in
[`packages/core/test/fixtures/cda`](./packages/core/test/fixtures/cda).

## Making a pull request

1. Fork the repo and branch from `main`.
2. Match the existing pattern: each C-CDA section is one file in
   `packages/core/src/cda-to-fhir/sections/` (and its reverse in
   `packages/core/src/fhir-to-cda/sections/`) with an explicit mapping table — no
   inference or guessing, every field traceable in
   [`docs/CCDA_FHIR_MAPPING.md`](./docs/CCDA_FHIR_MAPPING.md).
3. Add tests in `packages/core/test/` following the existing files — a mapping change
   without a test won't be merged.
4. If you touched what fields are mapped, update
   [`docs/CCDA_FHIR_MAPPING.md`](./docs/CCDA_FHIR_MAPPING.md) in the same PR.
5. Never log a PHI value — structural/shape info only (see `SECURITY.md` for the scope
   this applies to). If your change adds a log line or error message, check it against
   this before opening the PR.
6. Run `npm run lint`, `npm run format:check`, `npm test -w packages/core`, and
   `npm run build` before opening the PR.
7. Describe the _why_ in the PR description — what real-world case motivated the change.

## Code of conduct

Be direct and be kind. Disagreements about a mapping decision are welcome and should be
resolved with a sample document and a citation to the relevant C-CDA/FHIR field
definition, not opinion.
