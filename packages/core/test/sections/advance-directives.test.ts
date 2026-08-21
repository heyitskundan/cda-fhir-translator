import { describe, expect, it } from "vitest";
import { parseCdaXml } from "../../src/cda-to-fhir/parser.js";
import { mapAdvanceDirectivesSection } from "../../src/cda-to-fhir/sections/advance-directives.js";

const patientRef = { reference: "Patient/patient" };

function doc(section: string): ReturnType<typeof parseCdaXml> {
  return parseCdaXml(`<ClinicalDocument xmlns="urn:hl7-org:v3">
    <component><structuredBody><component>${section}</component></structuredBody></component>
  </ClinicalDocument>`);
}

describe("mapAdvanceDirectivesSection", () => {
  it("maps an observation to a Consent with category and status", () => {
    const root = doc(`<section>
      <code code="42348-3" codeSystem="2.16.840.1.113883.6.1"/>
      <entry><organizer><component><observation>
        <templateId root="2.16.840.1.113883.10.20.22.4.48"/>
        <code code="304251008" codeSystem="2.16.840.1.113883.6.96" displayName="DNR"/>
        <statusCode code="completed"/>
      </observation></component></organizer></entry>
    </section>`);

    const result = mapAdvanceDirectivesSection(root, patientRef);

    expect(result.resources).toHaveLength(1);
    const consent = result.resources[0] as {
      status?: string;
      category?: { coding?: { code?: string }[] }[];
    };
    expect(consent.status).toBe("active");
    expect(consent.category?.[0]?.coding?.[0]?.code).toBe("304251008");
    expect(result.warnings).toHaveLength(0);
  });

  it("warns instead of mapping when the observation code is missing", () => {
    const root = doc(`<section>
      <code code="42348-3" codeSystem="2.16.840.1.113883.6.1"/>
      <entry><organizer><component><observation>
        <templateId root="2.16.840.1.113883.10.20.22.4.48"/>
        <statusCode code="completed"/>
      </observation></component></organizer></entry>
    </section>`);

    const result = mapAdvanceDirectivesSection(root, patientRef);

    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
  });

  it("returns no resources or warnings when the section is absent", () => {
    const root = doc(`<section><code code="10160-0" codeSystem="2.16.840.1.113883.6.1"/></section>`);
    const result = mapAdvanceDirectivesSection(root, patientRef);
    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });
});
