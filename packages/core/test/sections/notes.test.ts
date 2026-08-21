import { describe, expect, it } from "vitest";
import { parseCdaXml } from "../../src/cda-to-fhir/parser.js";
import { mapNotesSection } from "../../src/cda-to-fhir/sections/notes.js";

const patientRef = { reference: "Patient/patient" };

function doc(section: string): ReturnType<typeof parseCdaXml> {
  return parseCdaXml(`<ClinicalDocument xmlns="urn:hl7-org:v3">
    <component><structuredBody><component>${section}</component></structuredBody></component>
  </ClinicalDocument>`);
}

describe("mapNotesSection", () => {
  it("finds the section by its templateId (not a fixed LOINC) and maps a Note Activity", () => {
    const root = doc(`<section>
      <title>Nurse Note</title>
      <code code="11488-4" codeSystem="2.16.840.1.113883.11.20.9.68"/>
      <templateId root="2.16.840.1.113883.10.20.22.2.65"/>
      <entry><act classCode="ACT" moodCode="EVN">
        <templateId root="2.16.840.1.113883.10.20.22.4.202"/>
        <code code="11488-4" codeSystem="2.16.840.1.113883.6.1" displayName="Consult note"/>
        <statusCode code="completed"/>
        <text>Patient stable overnight.</text>
      </act></entry>
    </section>`);

    const result = mapNotesSection(root, patientRef);

    expect(result.resources).toHaveLength(1);
    const note = result.resources[0] as {
      status?: string;
      type?: { coding?: { code?: string }[] };
      description?: string;
    };
    expect(note.status).toBe("completed");
    expect(note.type?.coding?.[0]?.code).toBe("11488-4");
    expect(note.description).toBe("Patient stable overnight.");
    expect(result.warnings).toHaveLength(0);
  });

  it("returns no resources or warnings when no section carries the Notes templateId", () => {
    const root = doc(`<section><code code="10160-0" codeSystem="2.16.840.1.113883.6.1"/></section>`);
    const result = mapNotesSection(root, patientRef);
    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("warns when the Notes section is present but has no entries", () => {
    const root = doc(`<section>
      <code code="11488-4" codeSystem="2.16.840.1.113883.11.20.9.68"/>
      <templateId root="2.16.840.1.113883.10.20.22.2.65"/>
    </section>`);
    const result = mapNotesSection(root, patientRef);
    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
  });
});
