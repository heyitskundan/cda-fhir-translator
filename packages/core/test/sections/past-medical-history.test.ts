import { describe, expect, it } from "vitest";
import { parseCdaXml } from "../../src/cda-to-fhir/parser.js";
import { mapPastMedicalHistorySection } from "../../src/cda-to-fhir/sections/past-medical-history.js";

const patientRef = { reference: "Patient/patient" };

function doc(section: string): ReturnType<typeof parseCdaXml> {
  return parseCdaXml(`<ClinicalDocument xmlns="urn:hl7-org:v3">
    <component><structuredBody><component>${section}</component></structuredBody></component>
  </ClinicalDocument>`);
}

describe("mapPastMedicalHistorySection", () => {
  it("maps an observation to a Condition tagged Past Medical History", () => {
    const root = doc(`<section>
      <code code="11348-0" codeSystem="2.16.840.1.113883.6.1"/>
      <entry><act><entryRelationship typeCode="SUBJ"><observation>
        <templateId root="2.16.840.1.113883.10.20.22.4.4"/>
        <value xsi:type="CD" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" code="195967001" codeSystem="2.16.840.1.113883.6.96" displayName="Asthma"/>
        <effectiveTime><low value="20100101"/></effectiveTime>
      </observation></entryRelationship></act></entry>
    </section>`);

    const result = mapPastMedicalHistorySection(root, patientRef);

    expect(result.resources).toHaveLength(1);
    const condition = result.resources[0] as {
      code?: { coding?: { code?: string }[] };
      category?: { text?: string }[];
      onsetDateTime?: string;
    };
    expect(condition.code?.coding?.[0]?.code).toBe("195967001");
    expect(condition.category?.[0]?.text).toBe("Past Medical History");
    expect(condition.onsetDateTime).toBe("2010-01-01");
    expect(result.warnings).toHaveLength(0);
  });

  it("warns instead of mapping when the value is missing", () => {
    const root = doc(`<section>
      <code code="11348-0" codeSystem="2.16.840.1.113883.6.1"/>
      <entry><act><entryRelationship typeCode="SUBJ"><observation>
        <templateId root="2.16.840.1.113883.10.20.22.4.4"/>
      </observation></entryRelationship></act></entry>
    </section>`);

    const result = mapPastMedicalHistorySection(root, patientRef);

    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
  });

  it("returns no resources or warnings when the section is absent", () => {
    const root = doc(`<section><code code="10160-0" codeSystem="2.16.840.1.113883.6.1"/></section>`);
    const result = mapPastMedicalHistorySection(root, patientRef);
    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });
});
