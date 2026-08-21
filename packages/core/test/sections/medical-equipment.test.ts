import { describe, expect, it } from "vitest";
import { parseCdaXml } from "../../src/cda-to-fhir/parser.js";
import { mapMedicalEquipmentSection } from "../../src/cda-to-fhir/sections/medical-equipment.js";

const patientRef = { reference: "Patient/patient" };

function doc(section: string): ReturnType<typeof parseCdaXml> {
  return parseCdaXml(`<ClinicalDocument xmlns="urn:hl7-org:v3">
    <component><structuredBody><component>${section}</component></structuredBody></component>
  </ClinicalDocument>`);
}

describe("mapMedicalEquipmentSection", () => {
  it("maps a supply entry to a Device with type and status", () => {
    const root = doc(`<section>
      <code code="46264-8" codeSystem="2.16.840.1.113883.6.1"/>
      <entry><supply classCode="SPLY" moodCode="EVN">
        <templateId root="2.16.840.1.113883.10.20.22.4.50"/>
        <statusCode code="completed"/>
        <participant typeCode="PRD"><participantRole><playingDevice>
          <code code="58938008" codeSystem="2.16.840.1.113883.6.96" displayName="Wheelchair"/>
        </playingDevice></participantRole></participant>
      </supply></entry>
    </section>`);

    const result = mapMedicalEquipmentSection(root, patientRef);

    expect(result.resources).toHaveLength(1);
    const device = result.resources[0] as {
      type?: { coding?: { code?: string }[] };
      status?: string;
    };
    expect(device.type?.coding?.[0]?.code).toBe("58938008");
    expect(device.status).toBe("completed");
    expect(result.warnings).toHaveLength(0);
  });

  it("warns instead of mapping when the playingDevice code is missing", () => {
    const root = doc(`<section>
      <code code="46264-8" codeSystem="2.16.840.1.113883.6.1"/>
      <entry><supply classCode="SPLY" moodCode="EVN">
        <templateId root="2.16.840.1.113883.10.20.22.4.50"/>
        <statusCode code="completed"/>
      </supply></entry>
    </section>`);

    const result = mapMedicalEquipmentSection(root, patientRef);

    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
  });

  it("returns no resources or warnings when the section is absent", () => {
    const root = doc(`<section><code code="10160-0" codeSystem="2.16.840.1.113883.6.1"/></section>`);
    const result = mapMedicalEquipmentSection(root, patientRef);
    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });
});
