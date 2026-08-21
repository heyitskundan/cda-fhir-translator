# Security Policy

## Supported versions

Security fixes land on the latest published major version; older major versions are
not separately patched.

## Reporting a vulnerability

Do not open a public GitHub issue for a security report — report privately so a fix can
ship before the issue is public.

**Report to:** open a private [GitHub Security Advisory](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability)
on this repository (Security tab → **Report a vulnerability**).

Include, if you can:

- The vulnerable code path (file/function, or the input that triggers it).
- Impact — what an attacker could do with it.
- A minimal reproduction using synthetic input only. If you found the issue via real
  patient data, describe the _shape_ of the input rather than pasting the data itself.

Expect an acknowledgment within a few days. This is a solo-maintained project — there's
no formal SLA, but security reports are treated as highest priority.

## PHI handling

This package is a **processing tool, not a storage system**. It must never log, cache,
persist, or transmit PHI:

- Logging is structural/shape-only (e.g. `"Parsed CDA document: 3 sections, 12 entries"`,
  `"Missing required section: Allergies"`) — never a PHI value. Error paths use the
  C-CDA XPath or FHIR path, never the value at that path.
- No file writes during translation — no temp files, no on-disk caches. No in-memory
  stores that outlive a single function call. Input objects are never mutated.
- This tool alone does not make a system HIPAA-compliant; the caller is responsible for
  securing input/output data in transit and at rest, and a BAA with infrastructure
  providers is still required.

## Scope

This package parses and translates C-CDA XML / FHIR R4 JSON, performs no network I/O and
no persistence — the realistic attack surface is the parser itself: a malformed or
adversarial input causing a crash, excessive resource consumption, or (via the XML
parser) entity expansion / external entity resolution. Reports about the demo app in
`client/` (a static, client-side-only page) are also in scope, though its attack surface
is smaller for the same reasons.

Out of scope: vulnerabilities in this repo's own `devDependencies` (build/test tooling)
that don't affect the published package or the built demo — track those via `npm audit`
and normal dependency updates instead of a security report.
