import { describe, expect, it } from "vitest";
import { parseCdaXml } from "../../src/cda-to-fhir/parser.js";
import { mapAdmissionMedicationsSection } from "../../src/cda-to-fhir/sections/admission-medications.js";

const patientRef = { reference: "Patient/patient" };

function doc(section: string): ReturnType<typeof parseCdaXml> {
  return parseCdaXml(`<ClinicalDocument xmlns="urn:hl7-org:v3">
    <component><structuredBody><component>${section}</component></structuredBody></component>
  </ClinicalDocument>`);
}

describe("mapAdmissionMedicationsSection", () => {
  it("maps a substanceAdministration entry to a MedicationStatement tagged Admission Medication", () => {
    const root = doc(`<section>
      <code code="42346-7" codeSystem="2.16.840.1.113883.6.1"/>
      <entry><substanceAdministration classCode="SBADM" moodCode="EVN">
        <templateId root="2.16.840.1.113883.10.20.22.4.36"/>
        <statusCode code="active"/>
        <consumable><manufacturedProduct><manufacturedMaterial>
          <code code="197517" codeSystem="2.16.840.1.113883.6.88" displayName="Metformin"/>
        </manufacturedMaterial></manufacturedProduct></consumable>
      </substanceAdministration></entry>
    </section>`);

    const result = mapAdmissionMedicationsSection(root, patientRef);

    expect(result.resources).toHaveLength(1);
    const med = result.resources[0] as { category?: { text?: string }[] };
    expect(med.category?.[0]?.text).toBe("Admission Medication");
    expect(result.warnings).toHaveLength(0);
  });

  it("returns no resources or warnings when the section is absent", () => {
    const root = doc(`<section><code code="10160-0" codeSystem="2.16.840.1.113883.6.1"/></section>`);
    const result = mapAdmissionMedicationsSection(root, patientRef);
    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("warns instead of mapping when the medication code is missing", () => {
    const root = doc(`<section>
      <code code="42346-7" codeSystem="2.16.840.1.113883.6.1"/>
      <entry><substanceAdministration classCode="SBADM" moodCode="EVN">
        <templateId root="2.16.840.1.113883.10.20.22.4.36"/>
        <statusCode code="active"/>
      </substanceAdministration></entry>
    </section>`);

    const result = mapAdmissionMedicationsSection(root, patientRef);

    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
  });
});
