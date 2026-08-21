import { describe, expect, it } from "vitest";
import { parseCdaXml } from "../../src/cda-to-fhir/parser.js";
import { mapCareTeamsSection } from "../../src/cda-to-fhir/sections/care-teams.js";

const patientRef = { reference: "Patient/patient" };

function doc(section: string): ReturnType<typeof parseCdaXml> {
  return parseCdaXml(`<ClinicalDocument xmlns="urn:hl7-org:v3">
    <component><structuredBody><component>${section}</component></structuredBody></component>
  </ClinicalDocument>`);
}

describe("mapCareTeamsSection", () => {
  it("maps an organizer to a CareTeam with name and status", () => {
    const root = doc(`<section>
      <code code="85847-2" codeSystem="2.16.840.1.113883.6.1"/>
      <entry><organizer classCode="CLUSTER" moodCode="EVN">
        <templateId root="2.16.840.1.113883.10.20.22.4.500"/>
        <code code="diabetes-care" codeSystem="2.16.840.1.113883.6.1" displayName="Diabetes Care Team"/>
        <statusCode code="active"/>
      </organizer></entry>
    </section>`);

    const result = mapCareTeamsSection(root, patientRef);

    expect(result.resources).toHaveLength(1);
    const careTeam = result.resources[0] as { name?: string; status?: string };
    expect(careTeam.name).toBe("Diabetes Care Team");
    expect(careTeam.status).toBe("active");
    expect(result.warnings).toHaveLength(0);
  });

  it("returns no resources or warnings when the section is absent", () => {
    const root = doc(`<section><code code="10160-0" codeSystem="2.16.840.1.113883.6.1"/></section>`);
    const result = mapCareTeamsSection(root, patientRef);
    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("warns instead of mapping when the section has no organizer entries", () => {
    const root = doc(`<section><code code="85847-2" codeSystem="2.16.840.1.113883.6.1"/></section>`);
    const result = mapCareTeamsSection(root, patientRef);
    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
  });
});
