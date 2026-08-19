import { describe, expect, it } from "vitest";
import { parseCdaXml } from "../../src/cda-to-fhir/parser.js";
import { mapImmunizationsSection } from "../../src/cda-to-fhir/sections/immunizations.js";

const patientRef = { reference: "Patient/patient" };

function doc(section: string): ReturnType<typeof parseCdaXml> {
  return parseCdaXml(`<ClinicalDocument xmlns="urn:hl7-org:v3">
    <component><structuredBody><component>${section}</component></structuredBody></component>
  </ClinicalDocument>`);
}

describe("mapImmunizationsSection", () => {
  it("maps a substanceAdministration entry to an Immunization", () => {
    const root = doc(`<section>
      <code code="11369-6" codeSystem="2.16.840.1.113883.6.1"/>
      <entry>
        <substanceAdministration classCode="SBADM" moodCode="EVN">
          <templateId root="2.16.840.1.113883.10.20.22.4.52"/>
          <statusCode code="completed"/>
          <effectiveTime value="20220115"/>
          <consumable>
            <manufacturedProduct>
              <manufacturedMaterial>
                <code code="140" codeSystem="2.16.840.1.113883.12.292" displayName="Influenza"/>
              </manufacturedMaterial>
            </manufacturedProduct>
          </consumable>
        </substanceAdministration>
      </entry>
    </section>`);

    const result = mapImmunizationsSection(root, patientRef);

    expect(result.resources).toHaveLength(1);
    const imm = result.resources[0] as {
      status?: string;
      vaccineCode?: { coding?: { code?: string }[] };
      occurrenceDateTime?: string;
    };
    expect(imm.status).toBe("completed");
    expect(imm.vaccineCode?.coding?.[0]?.code).toBe("140");
    expect(imm.occurrenceDateTime).toBe("2022-01-15");
    expect(result.warnings).toHaveLength(0);
  });

  it("warns instead of mapping when the vaccine code is missing", () => {
    const root = doc(`<section>
      <code code="11369-6" codeSystem="2.16.840.1.113883.6.1"/>
      <entry>
        <substanceAdministration classCode="SBADM" moodCode="EVN">
          <templateId root="2.16.840.1.113883.10.20.22.4.52"/>
          <statusCode code="completed"/>
        </substanceAdministration>
      </entry>
    </section>`);

    const result = mapImmunizationsSection(root, patientRef);

    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
  });

  it("returns no resources or warnings when the section is absent", () => {
    const root = doc(
      `<section><code code="10160-0" codeSystem="2.16.840.1.113883.6.1"/></section>`,
    );
    const result = mapImmunizationsSection(root, patientRef);
    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });
});
