import { describe, expect, it } from "vitest";
import { parseCdaXml } from "../../src/cda-to-fhir/parser.js";
import { mapVitalsSection } from "../../src/cda-to-fhir/sections/vitals.js";

const patientRef = { reference: "Patient/patient" };

function doc(section: string): ReturnType<typeof parseCdaXml> {
  return parseCdaXml(`<ClinicalDocument xmlns="urn:hl7-org:v3">
    <component><structuredBody><component>${section}</component></structuredBody></component>
  </ClinicalDocument>`);
}

describe("mapVitalsSection", () => {
  it("maps a vitals organizer's components to category=vital-signs Observations", () => {
    const root = doc(`<section>
      <code code="8716-3" codeSystem="2.16.840.1.113883.6.1"/>
      <entry>
        <organizer>
          <templateId root="2.16.840.1.113883.10.20.22.4.1"/>
          <code code="46680005" codeSystem="2.16.840.1.113883.6.96"/>
          <component>
            <observation>
              <code code="8867-4" codeSystem="2.16.840.1.113883.6.1" displayName="Heart rate"/>
              <effectiveTime value="20240105080000-0500"/>
              <value xsi:type="PQ" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" value="72" unit="/min"/>
            </observation>
          </component>
        </organizer>
      </entry>
    </section>`);

    const result = mapVitalsSection(root, patientRef);

    expect(result.resources).toHaveLength(1);
    const obs = result.resources[0] as {
      category?: { coding?: { code?: string }[] }[];
      valueQuantity?: { value?: number; unit?: string };
    };
    expect(obs.category?.[0]?.coding?.[0]?.code).toBe("vital-signs");
    expect(obs.valueQuantity).toEqual({ value: 72, unit: "/min" });
  });
});
