import { describe, expect, it } from "vitest";
import { parseCdaXml } from "../../src/cda-to-fhir/parser.js";
import { mapEncountersSection } from "../../src/cda-to-fhir/sections/encounters.js";

const patientRef = { reference: "Patient/patient" };

function doc(section: string): ReturnType<typeof parseCdaXml> {
  return parseCdaXml(`<ClinicalDocument xmlns="urn:hl7-org:v3">
    <component><structuredBody><component>${section}</component></structuredBody></component>
  </ClinicalDocument>`);
}

describe("mapEncountersSection", () => {
  it("maps an encounter entry to an Encounter with class, status, and period", () => {
    const root = doc(`<section>
      <code code="46240-8" codeSystem="2.16.840.1.113883.6.1"/>
      <entry>
        <encounter classCode="ENC" moodCode="EVN">
          <templateId root="2.16.840.1.113883.10.20.22.4.49"/>
          <code code="99213" codeSystem="2.16.840.1.113883.6.12" displayName="Office visit"/>
          <statusCode code="completed"/>
          <effectiveTime><low value="20220301"/><high value="20220301"/></effectiveTime>
        </encounter>
      </entry>
    </section>`);

    const result = mapEncountersSection(root, patientRef);

    expect(result.resources).toHaveLength(1);
    const encounter = result.resources[0] as {
      status?: string;
      class?: { code?: string };
      period?: { start?: string; end?: string };
    };
    expect(encounter.status).toBe("finished");
    expect(encounter.class?.code).toBe("99213");
    expect(encounter.period?.start).toBe("2022-03-01");
    expect(result.warnings).toHaveLength(0);
  });

  it("warns instead of mapping when the encounter code is missing", () => {
    const root = doc(`<section>
      <code code="46240-8" codeSystem="2.16.840.1.113883.6.1"/>
      <entry>
        <encounter classCode="ENC" moodCode="EVN">
          <templateId root="2.16.840.1.113883.10.20.22.4.49"/>
          <statusCode code="completed"/>
        </encounter>
      </entry>
    </section>`);

    const result = mapEncountersSection(root, patientRef);

    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
  });

  it("returns no resources or warnings when the section is absent", () => {
    const root = doc(
      `<section><code code="10160-0" codeSystem="2.16.840.1.113883.6.1"/></section>`,
    );
    const result = mapEncountersSection(root, patientRef);
    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });
});
