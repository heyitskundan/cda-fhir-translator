import { describe, expect, it } from "vitest";
import { parseCdaXml } from "../../src/cda-to-fhir/parser.js";
import { mapFamilyHistorySection } from "../../src/cda-to-fhir/sections/family-history.js";

const patientRef = { reference: "Patient/patient" };

function doc(section: string): ReturnType<typeof parseCdaXml> {
  return parseCdaXml(`<ClinicalDocument xmlns="urn:hl7-org:v3">
    <component><structuredBody><component>${section}</component></structuredBody></component>
  </ClinicalDocument>`);
}

describe("mapFamilyHistorySection", () => {
  it("maps an organizer to a FamilyMemberHistory with relationship and conditions", () => {
    const root = doc(`<section>
      <code code="10157-6" codeSystem="2.16.840.1.113883.6.1"/>
      <entry>
        <organizer classCode="CLUSTER" moodCode="EVN">
          <templateId root="2.16.840.1.113883.10.20.22.4.45"/>
          <statusCode code="completed"/>
          <subject>
            <relatedSubject classCode="PRS">
              <code code="MTH" codeSystem="2.16.840.1.113883.5.111" displayName="Mother"/>
            </relatedSubject>
          </subject>
          <component>
            <observation classCode="OBS" moodCode="EVN">
              <templateId root="2.16.840.1.113883.10.20.22.4.46"/>
              <value xsi:type="CD" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" code="38341003" codeSystem="2.16.840.1.113883.6.96" displayName="Hypertension"/>
            </observation>
          </component>
        </organizer>
      </entry>
    </section>`);

    const result = mapFamilyHistorySection(root, patientRef);

    expect(result.resources).toHaveLength(1);
    const fmh = result.resources[0] as {
      relationship?: { coding?: { code?: string }[] };
      condition?: { code?: { coding?: { code?: string }[] } }[];
    };
    expect(fmh.relationship?.coding?.[0]?.code).toBe("MTH");
    expect(fmh.condition?.[0]?.code?.coding?.[0]?.code).toBe("38341003");
    expect(result.warnings).toHaveLength(0);
  });

  it("warns instead of mapping when the relatedSubject code is missing", () => {
    const root = doc(`<section>
      <code code="10157-6" codeSystem="2.16.840.1.113883.6.1"/>
      <entry>
        <organizer classCode="CLUSTER" moodCode="EVN">
          <templateId root="2.16.840.1.113883.10.20.22.4.45"/>
          <statusCode code="completed"/>
        </organizer>
      </entry>
    </section>`);

    const result = mapFamilyHistorySection(root, patientRef);

    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
  });

  it("returns no resources or warnings when the section is absent", () => {
    const root = doc(
      `<section><code code="10160-0" codeSystem="2.16.840.1.113883.6.1"/></section>`,
    );
    const result = mapFamilyHistorySection(root, patientRef);
    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });
});
