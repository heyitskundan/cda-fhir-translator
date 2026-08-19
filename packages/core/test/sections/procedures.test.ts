import { describe, expect, it } from "vitest";
import { parseCdaXml } from "../../src/cda-to-fhir/parser.js";
import { mapProceduresSection } from "../../src/cda-to-fhir/sections/procedures.js";

const patientRef = { reference: "Patient/patient" };

function doc(section: string): ReturnType<typeof parseCdaXml> {
  return parseCdaXml(`<ClinicalDocument xmlns="urn:hl7-org:v3">
    <component><structuredBody><component>${section}</component></structuredBody></component>
  </ClinicalDocument>`);
}

describe("mapProceduresSection", () => {
  it("maps a procedure entry to a Procedure with code, status, and performedDateTime", () => {
    const root = doc(`<section>
      <code code="47519-4" codeSystem="2.16.840.1.113883.6.1"/>
      <entry>
        <procedure classCode="PROC" moodCode="EVN">
          <templateId root="2.16.840.1.113883.10.20.22.4.14"/>
          <code code="44950" codeSystem="2.16.840.1.113883.6.12" displayName="Appendectomy"/>
          <statusCode code="completed"/>
          <effectiveTime value="20210610"/>
        </procedure>
      </entry>
    </section>`);

    const result = mapProceduresSection(root, patientRef);

    expect(result.resources).toHaveLength(1);
    const procedure = result.resources[0] as {
      status?: string;
      code?: { coding?: { code?: string }[] };
      performedDateTime?: string;
    };
    expect(procedure.status).toBe("completed");
    expect(procedure.code?.coding?.[0]?.code).toBe("44950");
    expect(procedure.performedDateTime).toBe("2021-06-10");
    expect(result.warnings).toHaveLength(0);
  });

  it("defaults status to unknown when statusCode is missing", () => {
    const root = doc(`<section>
      <code code="47519-4" codeSystem="2.16.840.1.113883.6.1"/>
      <entry>
        <procedure classCode="PROC" moodCode="EVN">
          <templateId root="2.16.840.1.113883.10.20.22.4.14"/>
          <code code="44950" codeSystem="2.16.840.1.113883.6.12"/>
        </procedure>
      </entry>
    </section>`);

    const result = mapProceduresSection(root, patientRef);

    expect((result.resources[0] as { status?: string }).status).toBe("unknown");
  });

  it("warns instead of mapping when the procedure code is missing", () => {
    const root = doc(`<section>
      <code code="47519-4" codeSystem="2.16.840.1.113883.6.1"/>
      <entry>
        <procedure classCode="PROC" moodCode="EVN">
          <templateId root="2.16.840.1.113883.10.20.22.4.14"/>
          <statusCode code="completed"/>
        </procedure>
      </entry>
    </section>`);

    const result = mapProceduresSection(root, patientRef);

    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
  });

  it("returns no resources or warnings when the section is absent", () => {
    const root = doc(
      `<section><code code="10160-0" codeSystem="2.16.840.1.113883.6.1"/></section>`,
    );
    const result = mapProceduresSection(root, patientRef);
    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });
});
