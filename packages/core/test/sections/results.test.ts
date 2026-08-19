import { describe, expect, it } from "vitest";
import { parseCdaXml } from "../../src/cda-to-fhir/parser.js";
import { mapResultsSection } from "../../src/cda-to-fhir/sections/results.js";

const patientRef = { reference: "Patient/patient" };

function doc(section: string): ReturnType<typeof parseCdaXml> {
  return parseCdaXml(`<ClinicalDocument xmlns="urn:hl7-org:v3">
    <component><structuredBody><component>${section}</component></structuredBody></component>
  </ClinicalDocument>`);
}

describe("mapResultsSection", () => {
  it("maps an organizer to a DiagnosticReport referencing its Observation children", () => {
    const root = doc(`<section>
      <code code="30954-2" codeSystem="2.16.840.1.113883.6.1"/>
      <entry>
        <organizer>
          <templateId root="2.16.840.1.113883.10.20.22.4.1"/>
          <code code="24323-8" codeSystem="2.16.840.1.113883.6.1" displayName="Comprehensive metabolic panel"/>
          <component>
            <observation>
              <code code="2345-7" codeSystem="2.16.840.1.113883.6.1" displayName="Glucose"/>
              <effectiveTime value="20240105080000-0500"/>
              <value xsi:type="PQ" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" value="98" unit="mg/dL"/>
            </observation>
          </component>
        </organizer>
      </entry>
    </section>`);

    const result = mapResultsSection(root, patientRef);

    const report = result.resources.find((r) => r.resourceType === "DiagnosticReport") as
      { result?: { reference: string }[] } | undefined;
    const observation = result.resources.find((r) => r.resourceType === "Observation") as
      { valueQuantity?: { value?: number; unit?: string } } | undefined;

    expect(report).toBeDefined();
    expect(observation).toBeDefined();
    expect(observation?.valueQuantity).toEqual({ value: 98, unit: "mg/dL" });
    expect(report?.result?.[0]?.reference).toBe(
      `Observation/${(observation as { id: string }).id}`,
    );
  });

  it("warns when an organizer has no code", () => {
    const root = doc(`<section>
      <code code="30954-2" codeSystem="2.16.840.1.113883.6.1"/>
      <entry>
        <organizer>
          <templateId root="2.16.840.1.113883.10.20.22.4.1"/>
        </organizer>
      </entry>
    </section>`);

    const result = mapResultsSection(root, patientRef);
    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
  });
});
