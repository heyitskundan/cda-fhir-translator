import { describe, expect, it } from "vitest";
import { parseCdaXml } from "../../src/cda-to-fhir/parser.js";
import { mapProblemsSection } from "../../src/cda-to-fhir/sections/problems.js";

const patientRef = { reference: "Patient/patient" };

function doc(section: string): ReturnType<typeof parseCdaXml> {
  return parseCdaXml(`<ClinicalDocument xmlns="urn:hl7-org:v3">
    <component><structuredBody><component>${section}</component></structuredBody></component>
  </ClinicalDocument>`);
}

describe("mapProblemsSection", () => {
  it("maps a problem observation to a Condition with onset and abatement", () => {
    const root = doc(`<section>
      <code code="11450-4" codeSystem="2.16.840.1.113883.6.1"/>
      <entry>
        <act>
          <entryRelationship typeCode="SUBJ">
            <observation>
              <templateId root="2.16.840.1.113883.10.20.22.4.4"/>
              <effectiveTime><low value="20220115"/><high value="20230601"/></effectiveTime>
              <value xsi:type="CD" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" code="44054006" codeSystem="2.16.840.1.113883.6.96" displayName="Type 2 diabetes mellitus"/>
            </observation>
          </entryRelationship>
        </act>
      </entry>
    </section>`);

    const result = mapProblemsSection(root, patientRef);

    expect(result.resources).toHaveLength(1);
    const condition = result.resources[0] as {
      code?: { coding?: { code?: string }[] };
      onsetDateTime?: string;
      abatementDateTime?: string;
    };
    expect(condition.code?.coding?.[0]?.code).toBe("44054006");
    expect(condition.onsetDateTime).toBe("2022-01-15");
    expect(condition.abatementDateTime).toBe("2023-06-01");
  });

  it("skips an entry with no coded value", () => {
    const root = doc(`<section>
      <code code="11450-4" codeSystem="2.16.840.1.113883.6.1"/>
      <entry>
        <act>
          <entryRelationship typeCode="SUBJ">
            <observation>
              <templateId root="2.16.840.1.113883.10.20.22.4.4"/>
            </observation>
          </entryRelationship>
        </act>
      </entry>
    </section>`);

    const result = mapProblemsSection(root, patientRef);
    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
  });
});
