import { describe, expect, it } from "vitest";
import { parseCdaXml } from "../../src/cda-to-fhir/parser.js";
import { mapAllergiesSection } from "../../src/cda-to-fhir/sections/allergies.js";

const patientRef = { reference: "Patient/patient" };

function doc(section: string): ReturnType<typeof parseCdaXml> {
  return parseCdaXml(`<ClinicalDocument xmlns="urn:hl7-org:v3">
    <component><structuredBody><component>${section}</component></structuredBody></component>
  </ClinicalDocument>`);
}

describe("mapAllergiesSection", () => {
  it("maps an allergy act to an AllergyIntolerance with the allergen as code", () => {
    const root = doc(`<section>
      <code code="48765-2" codeSystem="2.16.840.1.113883.6.1"/>
      <entry>
        <act>
          <templateId root="2.16.840.1.113883.10.20.22.4.30"/>
          <statusCode code="active"/>
          <effectiveTime><low value="20200301"/></effectiveTime>
          <entryRelationship typeCode="SUBJ">
            <observation>
              <participant typeCode="CSM">
                <participantRole classCode="MANU">
                  <playingEntity classCode="MMAT">
                    <code code="7980" codeSystem="2.16.840.1.113883.6.88" displayName="Penicillin"/>
                  </playingEntity>
                </participantRole>
              </participant>
            </observation>
          </entryRelationship>
        </act>
      </entry>
    </section>`);

    const result = mapAllergiesSection(root, patientRef);

    expect(result.resources).toHaveLength(1);
    const allergy = result.resources[0] as { code?: { coding?: { code?: string }[] } };
    expect(allergy.code?.coding?.[0]?.code).toBe("7980");
    expect(result.warnings).toHaveLength(0);
  });

  it("warns instead of mapping when the allergen playingEntity code is missing", () => {
    const root = doc(`<section>
      <code code="48765-2" codeSystem="2.16.840.1.113883.6.1"/>
      <entry>
        <act>
          <templateId root="2.16.840.1.113883.10.20.22.4.30"/>
          <statusCode code="active"/>
        </act>
      </entry>
    </section>`);

    const result = mapAllergiesSection(root, patientRef);

    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
  });

  it("returns no resources or warnings when the section is absent", () => {
    const root = doc(
      `<section><code code="10160-0" codeSystem="2.16.840.1.113883.6.1"/></section>`,
    );
    const result = mapAllergiesSection(root, patientRef);
    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });
});
