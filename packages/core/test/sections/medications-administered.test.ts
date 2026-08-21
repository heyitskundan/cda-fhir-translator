import { describe, expect, it } from "vitest";
import { parseCdaXml } from "../../src/cda-to-fhir/parser.js";
import { mapMedicationsAdministeredSection } from "../../src/cda-to-fhir/sections/medications-administered.js";

const patientRef = { reference: "Patient/patient" };

function doc(section: string): ReturnType<typeof parseCdaXml> {
  return parseCdaXml(`<ClinicalDocument xmlns="urn:hl7-org:v3">
    <component><structuredBody><component>${section}</component></structuredBody></component>
  </ClinicalDocument>`);
}

describe("mapMedicationsAdministeredSection", () => {
  it("maps a substanceAdministration entry to a MedicationStatement tagged inpatient", () => {
    const root = doc(`<section>
      <code code="29549-3" codeSystem="2.16.840.1.113883.6.1"/>
      <entry><substanceAdministration classCode="SBADM" moodCode="EVN">
        <templateId root="2.16.840.1.113883.10.20.22.4.16"/>
        <statusCode code="completed"/>
        <consumable><manufacturedProduct><manufacturedMaterial>
          <code code="308136" codeSystem="2.16.840.1.113883.6.88" displayName="Morphine"/>
        </manufacturedMaterial></manufacturedProduct></consumable>
      </substanceAdministration></entry>
    </section>`);

    const result = mapMedicationsAdministeredSection(root, patientRef);

    expect(result.resources).toHaveLength(1);
    const med = result.resources[0] as {
      medicationCodeableConcept?: { coding?: { code?: string }[] };
      category?: { coding?: { code?: string }[] }[];
    };
    expect(med.medicationCodeableConcept?.coding?.[0]?.code).toBe("308136");
    expect(med.category?.[0]?.coding?.[0]?.code).toBe("inpatient");
    expect(result.warnings).toHaveLength(0);
  });

  it("warns instead of mapping when the medication code is missing", () => {
    const root = doc(`<section>
      <code code="29549-3" codeSystem="2.16.840.1.113883.6.1"/>
      <entry><substanceAdministration classCode="SBADM" moodCode="EVN">
        <templateId root="2.16.840.1.113883.10.20.22.4.16"/>
        <statusCode code="completed"/>
      </substanceAdministration></entry>
    </section>`);

    const result = mapMedicationsAdministeredSection(root, patientRef);

    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
  });

  it("returns no resources or warnings when the section is absent", () => {
    const root = doc(`<section><code code="10160-0" codeSystem="2.16.840.1.113883.6.1"/></section>`);
    const result = mapMedicationsAdministeredSection(root, patientRef);
    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });
});
