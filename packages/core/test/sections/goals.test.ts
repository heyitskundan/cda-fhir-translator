import { describe, expect, it } from "vitest";
import { parseCdaXml } from "../../src/cda-to-fhir/parser.js";
import { mapGoalsSection } from "../../src/cda-to-fhir/sections/goals.js";

const patientRef = { reference: "Patient/patient" };

function doc(section: string): ReturnType<typeof parseCdaXml> {
  return parseCdaXml(`<ClinicalDocument xmlns="urn:hl7-org:v3">
    <component><structuredBody><component>${section}</component></structuredBody></component>
  </ClinicalDocument>`);
}

describe("mapGoalsSection", () => {
  it("maps an observation to a Goal with description and lifecycleStatus", () => {
    const root = doc(`<section>
      <code code="61146-7" codeSystem="2.16.840.1.113883.6.1"/>
      <entry><observation classCode="OBS" moodCode="GOL">
        <templateId root="2.16.840.1.113883.10.20.22.4.121"/>
        <code code="target-a1c" codeSystem="2.16.840.1.113883.6.1" displayName="A1c below 7"/>
        <statusCode code="active"/>
      </observation></entry>
    </section>`);

    const result = mapGoalsSection(root, patientRef);

    expect(result.resources).toHaveLength(1);
    const goal = result.resources[0] as {
      lifecycleStatus?: string;
      description?: { coding?: { code?: string }[] };
    };
    expect(goal.lifecycleStatus).toBe("active");
    expect(goal.description?.coding?.[0]?.code).toBe("target-a1c");
    expect(result.warnings).toHaveLength(0);
  });

  it("warns instead of mapping when the observation code is missing", () => {
    const root = doc(`<section>
      <code code="61146-7" codeSystem="2.16.840.1.113883.6.1"/>
      <entry><observation classCode="OBS" moodCode="GOL">
        <templateId root="2.16.840.1.113883.10.20.22.4.121"/>
        <statusCode code="active"/>
      </observation></entry>
    </section>`);

    const result = mapGoalsSection(root, patientRef);

    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
  });

  it("returns no resources or warnings when the section is absent", () => {
    const root = doc(`<section><code code="10160-0" codeSystem="2.16.840.1.113883.6.1"/></section>`);
    const result = mapGoalsSection(root, patientRef);
    expect(result.resources).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });
});
