import { describe, expect, it } from "vitest";
import { parseCdaXml } from "../../src/cda-to-fhir/parser.js";
import { mapHealthConcernsSection } from "../../src/cda-to-fhir/sections/health-concerns.js";

const patientRef = { reference: "Patient/patient" };

function doc(section: string): ReturnType<typeof parseCdaXml> {
  return parseCdaXml(`<ClinicalDocument xmlns="urn:hl7-org:v3">
    <component><structuredBody><component>${section}</component></structuredBody></component>
  </ClinicalDocument>`);
}

describe("mapHealthConcernsSection", () => {
  it("maps an act to a Condition tagged with the health-concern category", () => {
    const root = doc(`<section>
      <code code="75310-3" codeSystem="2.16.840.1.113883.6.1"/>
      <entry><act classCode="ACT" moodCode="EVN">
        <templateId root="2.16.840.1.113883.10.20.22.4.132"/>
        <code code="88805009" codeSystem="2.16.840.1.113883.6.96" displayName="Chronic pain"/>
        <effectiveTime><low value="20200101"/></effectiveTime>
      </act></entry>
    </section>`);

    const result = mapHealthConcernsSection(root, patientRef);

    expect(result.resources).toHaveLength(1);
    const condition = result.resources[0] as {
      code?: { coding?: { code?: string }[] };
      category?: { coding?: { code?: string }[] }[];
      onsetDateTime?: string;
    };
    expect(condition.code?.coding?.[0]?.code).toBe("88805009");
    expect(condition.category?.[0]?.coding?.[0]?.code).toBe("health-concern");
    expect(condition.onsetDateTime).toBe("2020-01-01");
    expect(result.warnings).toHaveLength(0);
  });

  it("warns instead of mapping when the act code is missing", () => {
    const root = doc(`<section>
      <code code="75310-3" codeSystem="2.16.840.1.113883.6.1"/>
      <entry><act classCode="ACT" moodCode="EVN">
        <templateId root="2.16.840.1.113883.10.20.22.4.132"/>
      </act></entry>
    </section>`);

    const result = mapHealthConcernsSection(root, patientRef);

    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
  });

  it("returns no resources or warnings when the section is absent", () => {
    const root = doc(`<section><code code="10160-0" codeSystem="2.16.840.1.113883.6.1"/></section>`);
    const result = mapHealthConcernsSection(root, patientRef);
    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });
});
