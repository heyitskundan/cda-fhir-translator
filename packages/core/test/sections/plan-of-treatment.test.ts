import { describe, expect, it } from "vitest";
import { parseCdaXml } from "../../src/cda-to-fhir/parser.js";
import { mapPlanOfTreatmentSection } from "../../src/cda-to-fhir/sections/plan-of-treatment.js";

const patientRef = { reference: "Patient/patient" };

function doc(section: string): ReturnType<typeof parseCdaXml> {
  return parseCdaXml(`<ClinicalDocument xmlns="urn:hl7-org:v3">
    <component><structuredBody><component>${section}</component></structuredBody></component>
  </ClinicalDocument>`);
}

describe("mapPlanOfTreatmentSection", () => {
  it("maps a Planned Observation entry to a ServiceRequest tagged Plan of Treatment", () => {
    const root = doc(`<section>
      <code code="18776-5" codeSystem="2.16.840.1.113883.6.1"/>
      <entry><observation classCode="OBS" moodCode="INT">
        <templateId root="2.16.840.1.113883.10.20.22.4.44"/>
        <code code="24606-6" codeSystem="2.16.840.1.113883.6.1" displayName="Chest X-ray"/>
        <statusCode code="active"/>
      </observation></entry>
    </section>`);

    const result = mapPlanOfTreatmentSection(root, patientRef);

    expect(result.resources).toHaveLength(1);
    const sr = result.resources[0] as {
      intent?: string;
      category?: { text?: string }[];
      code?: { coding?: { code?: string }[] };
    };
    expect(sr.intent).toBe("plan");
    expect(sr.category?.[0]?.text).toBe("Plan of Treatment");
    expect(sr.code?.coding?.[0]?.code).toBe("24606-6");
    expect(result.warnings).toHaveLength(0);
  });

  it("maps a Planned Medication Activity's nested consumable code", () => {
    const root = doc(`<section>
      <code code="18776-5" codeSystem="2.16.840.1.113883.6.1"/>
      <entry><substanceAdministration classCode="SBADM" moodCode="INT">
        <templateId root="2.16.840.1.113883.10.20.22.4.42"/>
        <statusCode code="active"/>
        <consumable><manufacturedProduct><manufacturedMaterial>
          <code code="197361" codeSystem="2.16.840.1.113883.6.88" displayName="Lisinopril"/>
        </manufacturedMaterial></manufacturedProduct></consumable>
      </substanceAdministration></entry>
    </section>`);

    const result = mapPlanOfTreatmentSection(root, patientRef);

    expect(result.resources).toHaveLength(1);
    const sr = result.resources[0] as { code?: { coding?: { code?: string }[] } };
    expect(sr.code?.coding?.[0]?.code).toBe("197361");
  });

  it("returns no resources or warnings when the section is absent", () => {
    const root = doc(`<section><code code="10160-0" codeSystem="2.16.840.1.113883.6.1"/></section>`);
    const result = mapPlanOfTreatmentSection(root, patientRef);
    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("warns when the section is present but has no entries", () => {
    const root = doc(`<section><code code="18776-5" codeSystem="2.16.840.1.113883.6.1"/></section>`);
    const result = mapPlanOfTreatmentSection(root, patientRef);
    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
  });
});
