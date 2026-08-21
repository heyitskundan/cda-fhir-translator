import { describe, expect, it } from "vitest";
import { parseCdaXml } from "../../src/cda-to-fhir/parser.js";
import { mapPayersSection } from "../../src/cda-to-fhir/sections/payers.js";

const patientRef = { reference: "Patient/patient" };

function doc(section: string): ReturnType<typeof parseCdaXml> {
  return parseCdaXml(`<ClinicalDocument xmlns="urn:hl7-org:v3">
    <component><structuredBody><component>${section}</component></structuredBody></component>
  </ClinicalDocument>`);
}

describe("mapPayersSection", () => {
  it("maps a Coverage Activity entry to a Coverage with type and payor", () => {
    const root = doc(`<section>
      <code code="48768-6" codeSystem="2.16.840.1.113883.6.1"/>
      <entry>
        <act classCode="ACT" moodCode="EVN">
          <templateId root="2.16.840.1.113883.10.20.22.4.60"/>
          <statusCode code="completed"/>
          <entryRelationship typeCode="COMP">
            <act classCode="ACT" moodCode="EVN">
              <templateId root="2.16.840.1.113883.10.20.22.4.61"/>
              <code code="HMO" codeSystem="2.16.840.1.113883.3.221.5" displayName="Health Maintenance Organization"/>
              <performer typeCode="PRF">
                <assignedEntity>
                  <representedOrganization><name>Acme Health Plan</name></representedOrganization>
                </assignedEntity>
              </performer>
            </act>
          </entryRelationship>
        </act>
      </entry>
    </section>`);

    const result = mapPayersSection(root, patientRef);

    expect(result.resources).toHaveLength(1);
    const coverage = result.resources[0] as {
      status?: string;
      type?: { coding?: { code?: string }[] };
      payor?: { display?: string }[];
    };
    expect(coverage.status).toBe("active");
    expect(coverage.type?.coding?.[0]?.code).toBe("HMO");
    expect(coverage.payor?.[0]?.display).toBe("Acme Health Plan");
    expect(result.warnings).toHaveLength(0);
  });

  it("maps a Coverage Activity with no nested Policy Activity to a minimal Coverage", () => {
    const root = doc(`<section>
      <code code="48768-6" codeSystem="2.16.840.1.113883.6.1"/>
      <entry>
        <act classCode="ACT" moodCode="EVN">
          <templateId root="2.16.840.1.113883.10.20.22.4.60"/>
          <statusCode code="completed"/>
        </act>
      </entry>
    </section>`);

    const result = mapPayersSection(root, patientRef);

    expect(result.resources).toHaveLength(1);
    const coverage = result.resources[0] as { status?: string; type?: unknown };
    expect(coverage.status).toBe("active");
    expect(coverage.type).toBeUndefined();
    expect(result.warnings).toHaveLength(0);
  });

  it("returns no resources or warnings when the section is absent", () => {
    const root = doc(
      `<section><code code="10160-0" codeSystem="2.16.840.1.113883.6.1"/></section>`,
    );
    const result = mapPayersSection(root, patientRef);
    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });
});
