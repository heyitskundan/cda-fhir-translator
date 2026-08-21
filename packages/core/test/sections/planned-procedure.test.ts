import { describe, expect, it } from "vitest";
import { parseCdaXml } from "../../src/cda-to-fhir/parser.js";
import { mapPlannedProcedureSection } from "../../src/cda-to-fhir/sections/planned-procedure.js";

const patientRef = { reference: "Patient/patient" };

function doc(section: string): ReturnType<typeof parseCdaXml> {
  return parseCdaXml(`<ClinicalDocument xmlns="urn:hl7-org:v3">
    <component><structuredBody><component>${section}</component></structuredBody></component>
  </ClinicalDocument>`);
}

describe("mapPlannedProcedureSection", () => {
  it("maps a procedure entry to a ServiceRequest with intent=plan", () => {
    const root = doc(`<section>
      <code code="59772-4" codeSystem="2.16.840.1.113883.6.1"/>
      <entry><procedure classCode="PROC" moodCode="INT">
        <templateId root="2.16.840.1.113883.10.20.22.4.41"/>
        <code code="80146002" codeSystem="2.16.840.1.113883.6.96" displayName="Appendectomy"/>
        <statusCode code="active"/>
        <effectiveTime value="20240601"/>
      </procedure></entry>
    </section>`);

    const result = mapPlannedProcedureSection(root, patientRef);

    expect(result.resources).toHaveLength(1);
    const sr = result.resources[0] as {
      intent?: string;
      status?: string;
      code?: { coding?: { code?: string }[] };
      occurrenceDateTime?: string;
    };
    expect(sr.intent).toBe("plan");
    expect(sr.status).toBe("active");
    expect(sr.code?.coding?.[0]?.code).toBe("80146002");
    expect(sr.occurrenceDateTime).toBe("2024-06-01");
    expect(result.warnings).toHaveLength(0);
  });

  it("warns instead of mapping when the procedure code is missing", () => {
    const root = doc(`<section>
      <code code="59772-4" codeSystem="2.16.840.1.113883.6.1"/>
      <entry><procedure classCode="PROC" moodCode="INT">
        <templateId root="2.16.840.1.113883.10.20.22.4.41"/>
        <statusCode code="active"/>
      </procedure></entry>
    </section>`);

    const result = mapPlannedProcedureSection(root, patientRef);

    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
  });

  it("returns no resources or warnings when the section is absent", () => {
    const root = doc(`<section><code code="10160-0" codeSystem="2.16.840.1.113883.6.1"/></section>`);
    const result = mapPlannedProcedureSection(root, patientRef);
    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });
});
