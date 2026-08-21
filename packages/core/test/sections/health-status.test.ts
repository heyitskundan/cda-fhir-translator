import { describe, expect, it } from "vitest";
import { parseCdaXml } from "../../src/cda-to-fhir/parser.js";
import { mapHealthStatusSection } from "../../src/cda-to-fhir/sections/health-status.js";

const patientRef = { reference: "Patient/patient" };

function doc(section: string): ReturnType<typeof parseCdaXml> {
  return parseCdaXml(`<ClinicalDocument xmlns="urn:hl7-org:v3">
    <component><structuredBody><component>${section}</component></structuredBody></component>
  </ClinicalDocument>`);
}

describe("mapHealthStatusSection", () => {
  it("maps an Outcome Observation entry to an Observation", () => {
    const root = doc(`<section>
      <code code="11383-7" codeSystem="2.16.840.1.113883.6.1"/>
      <entry><observation classCode="OBS" moodCode="EVN">
        <templateId root="2.16.840.1.113883.10.20.22.4.144"/>
        <code code="outcome-1" codeSystem="2.16.840.1.113883.6.1" displayName="Wound healed"/>
        <statusCode code="completed"/>
      </observation></entry>
    </section>`);

    const result = mapHealthStatusSection(root, patientRef);

    expect(result.resources).toHaveLength(1);
    expect(result.warnings).toHaveLength(0);
  });

  it("merges Progress Toward Goal Observation entries from the same section", () => {
    const root = doc(`<section>
      <code code="11383-7" codeSystem="2.16.840.1.113883.6.1"/>
      <entry><observation classCode="OBS" moodCode="EVN">
        <templateId root="2.16.840.1.113883.10.20.22.4.144"/>
        <code code="outcome-1" codeSystem="2.16.840.1.113883.6.1"/>
        <statusCode code="completed"/>
      </observation></entry>
      <entry><observation classCode="OBS" moodCode="EVN">
        <templateId root="2.16.840.1.113883.10.20.22.4.110"/>
        <code code="progress-1" codeSystem="2.16.840.1.113883.6.1"/>
        <statusCode code="completed"/>
      </observation></entry>
    </section>`);

    const result = mapHealthStatusSection(root, patientRef);

    expect(result.resources).toHaveLength(2);
    expect(result.warnings).toHaveLength(0);
  });

  it("returns no resources or warnings when the section is absent", () => {
    const root = doc(`<section><code code="10160-0" codeSystem="2.16.840.1.113883.6.1"/></section>`);
    const result = mapHealthStatusSection(root, patientRef);
    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });
});
