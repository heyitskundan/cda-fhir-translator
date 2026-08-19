# client

Browser demo + docs site for `cda-fhir-translator`. React + Vite, imports `packages/core`
directly (no backend). Two views:

- **Translator** — paste C-CDA XML or a FHIR Bundle (JSON) and it translates in the
  browser, direction detected from the input's shape. Syntax-highlighted input/output,
  a field mapping trail, and a sample library.
- **Docs** — Getting Started, API Reference, Data Mapping & Schemas, and Changelog,
  hand-authored from the repo's real docs (not parsed from markdown at runtime).

```bash
npm run dev      # http://localhost:5173
npm run build
npm test
```
