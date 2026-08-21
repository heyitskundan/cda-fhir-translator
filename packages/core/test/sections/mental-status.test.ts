import { describe, expect, it } from "vitest";
import { parseCdaXml } from "../../src/cda-to-fhir/parser.js";
import { mapMentalStatusSection } from "../../src/cda-to-fhir/sections/mental-status.js";

const patientRef = { reference: "Patient/patient" };

function doc(section: string): ReturnType<typeof parseCdaXml> {
  return parseCdaXml(`<ClinicalDocument xmlns="urn:hl7-org:v3">
    <component><structuredBody><component>${section}</component></structuredBody></component>
  </ClinicalDocument>`);
}

describe("mapMentalStatusSection", () => {
  it("maps an observation to an Observation with the mental-status category", () => {
    const root = doc(`<section>
      <code code="10190-7" codeSystem="2.16.840.1.113883.6.1"/>
      <entry><observation classCode="OBS" moodCode="EVN">
        <templateId root="2.16.840.1.113883.10.20.22.4.74"/>
        <code code="454641000124102" codeSystem="2.16.840.1.113883.6.96" displayName="Oriented x3"/>
        <statusCode code="completed"/>
      </observation></entry>
    </section>`);

    const result = mapMentalStatusSection(root, patientRef);

    expect(result.resources).toHaveLength(1);
    const obs = result.resources[0] as { category?: { coding?: { code?: string }[] }[] };
    expect(obs.category?.[0]?.coding?.[0]?.code).toBe("mental-status");
    expect(result.warnings).toHaveLength(0);
  });

  it("warns instead of mapping when the observation code is missing", () => {
    const root = doc(`<section>
      <code code="10190-7" codeSystem="2.16.840.1.113883.6.1"/>
      <entry><observation classCode="OBS" moodCode="EVN">
        <templateId root="2.16.840.1.113883.10.20.22.4.74"/>
        <statusCode code="completed"/>
      </observation></entry>
    </section>`);

    const result = mapMentalStatusSection(root, patientRef);

    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
  });

  it("returns no resources or warnings when the section is absent", () => {
    const root = doc(`<section><code code="10160-0" codeSystem="2.16.840.1.113883.6.1"/></section>`);
    const result = mapMentalStatusSection(root, patientRef);
    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });
});
