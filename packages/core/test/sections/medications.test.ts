import { describe, expect, it } from "vitest";
import { parseCdaXml } from "../../src/cda-to-fhir/parser.js";
import { mapMedicationsSection } from "../../src/cda-to-fhir/sections/medications.js";

const patientRef = { reference: "Patient/patient" };

function doc(section: string): ReturnType<typeof parseCdaXml> {
  return parseCdaXml(`<ClinicalDocument xmlns="urn:hl7-org:v3">
    <component><structuredBody><component>${section}</component></structuredBody></component>
  </ClinicalDocument>`);
}

describe("mapMedicationsSection", () => {
  it("maps a substanceAdministration to a MedicationStatement with dose and route", () => {
    const root = doc(`<section>
      <code code="10160-0" codeSystem="2.16.840.1.113883.6.1"/>
      <entry>
        <substanceAdministration>
          <templateId root="2.16.840.1.113883.10.20.22.4.16"/>
          <statusCode code="active"/>
          <routeCode code="C38288" codeSystem="2.16.840.1.113883.3.26.1.1" displayName="ORAL"/>
          <doseQuantity value="10" unit="mg"/>
          <consumable>
            <manufacturedProduct>
              <manufacturedMaterial>
                <code code="197361" codeSystem="2.16.840.1.113883.6.88" displayName="Lisinopril 10 MG"/>
              </manufacturedMaterial>
            </manufacturedProduct>
          </consumable>
        </substanceAdministration>
      </entry>
    </section>`);

    const result = mapMedicationsSection(root, patientRef);

    expect(result.resources).toHaveLength(1);
    const med = result.resources[0] as {
      status: string;
      medicationCodeableConcept?: { coding?: { code?: string }[] };
      dosage?: { doseAndRate?: { doseQuantity?: { value?: number; unit?: string } }[] }[];
    };
    expect(med.status).toBe("active");
    expect(med.medicationCodeableConcept?.coding?.[0]?.code).toBe("197361");
    expect(med.dosage?.[0]?.doseAndRate?.[0]?.doseQuantity).toEqual({ value: 10, unit: "mg" });
  });

  it("skips an entry with no medication code and records a warning", () => {
    const root = doc(`<section>
      <code code="10160-0" codeSystem="2.16.840.1.113883.6.1"/>
      <entry>
        <substanceAdministration>
          <templateId root="2.16.840.1.113883.10.20.22.4.16"/>
          <statusCode code="active"/>
        </substanceAdministration>
      </entry>
    </section>`);

    const result = mapMedicationsSection(root, patientRef);
    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
  });
});
