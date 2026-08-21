import { describe, expect, it } from "vitest";
import { buildNotesSection } from "../../../src/fhir-to-cda/sections/notes.js";
import type { DocumentReference } from "../../../src/shared/types.js";

describe("buildNotesSection", () => {
  it("builds an act entry from a DocumentReference, tagging the section's own templateId", () => {
    const doc: DocumentReference = {
      resourceType: "DocumentReference",
      id: "note-1",
      status: "current",
      type: { coding: [{ code: "11488-4" }] },
      description: "Patient stable overnight.",
      date: "2024-06-01T10:00:00Z",
    };

    const result = buildNotesSection([doc]);

    expect(result.section).toBeDefined();
    const section = result.section as Record<string, unknown>;
    expect(section["templateId"]).toMatchObject({ "@root": "2.16.840.1.113883.10.20.22.2.65" });
    const entry = section["entry"] as Record<string, unknown>[];
    const act = entry[0]?.["act"] as Record<string, unknown>;
    expect(act["templateId"]).toMatchObject({ "@root": "2.16.840.1.113883.10.20.22.4.202" });
    expect(act["text"]).toBe("Patient stable overnight.");
    expect(result.mappings).toHaveLength(1);
  });

  it("returns no section when there are no document references", () => {
    const result = buildNotesSection([]);
    expect(result.section).toBeUndefined();
    expect(result.mappings).toEqual([]);
  });
});
