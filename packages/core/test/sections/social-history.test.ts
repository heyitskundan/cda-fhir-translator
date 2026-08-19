import { describe, expect, it } from "vitest";
import { parseCdaXml } from "../../src/cda-to-fhir/parser.js";
import { mapSocialHistorySection } from "../../src/cda-to-fhir/sections/social-history.js";

const patientRef = { reference: "Patient/patient" };

function doc(section: string): ReturnType<typeof parseCdaXml> {
  return parseCdaXml(`<ClinicalDocument xmlns="urn:hl7-org:v3">
    <component><structuredBody><component>${section}</component></structuredBody></component>
  </ClinicalDocument>`);
}

describe("mapSocialHistorySection", () => {
  it("maps a smoking status observation to an Observation with the social-history category", () => {
    const root = doc(`<section>
      <code code="29762-2" codeSystem="2.16.840.1.113883.6.1"/>
      <entry>
        <observation classCode="OBS" moodCode="EVN">
          <templateId root="2.16.840.1.113883.10.20.22.4.78"/>
          <code code="72166-2" codeSystem="2.16.840.1.113883.6.1" displayName="Tobacco smoking status"/>
          <statusCode code="completed"/>
          <effectiveTime value="20210601"/>
          <value xsi:type="CD" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" code="8517006" codeSystem="2.16.840.1.113883.6.96" displayName="Former smoker"/>
        </observation>
      </entry>
    </section>`);

    const result = mapSocialHistorySection(root, patientRef);

    expect(result.resources).toHaveLength(1);
    const obs = result.resources[0] as {
      category?: { coding?: { code?: string }[] }[];
      valueCodeableConcept?: { coding?: { code?: string }[] };
    };
    expect(obs.category?.[0]?.coding?.[0]?.code).toBe("social-history");
    expect(obs.valueCodeableConcept?.coding?.[0]?.code).toBe("8517006");
    expect(result.warnings).toHaveLength(0);
  });

  it("warns instead of mapping when the observation code is missing", () => {
    const root = doc(`<section>
      <code code="29762-2" codeSystem="2.16.840.1.113883.6.1"/>
      <entry>
        <observation classCode="OBS" moodCode="EVN">
          <templateId root="2.16.840.1.113883.10.20.22.4.78"/>
          <statusCode code="completed"/>
        </observation>
      </entry>
    </section>`);

    const result = mapSocialHistorySection(root, patientRef);

    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
  });

  it("returns no resources or warnings when the section is absent", () => {
    const root = doc(
      `<section><code code="10160-0" codeSystem="2.16.840.1.113883.6.1"/></section>`,
    );
    const result = mapSocialHistorySection(root, patientRef);
    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });
});
