import { describe, expect, it } from "vitest";
import { buildProblemsSection } from "../../../src/fhir-to-cda/sections/problems.js";
import type { Condition } from "../../../src/shared/types.js";

describe("buildProblemsSection", () => {
  it("builds an act/entryRelationship/observation entry with onset and abatement", () => {
    const condition: Condition = {
      resourceType: "Condition",
      id: "condition-1",
      subject: { reference: "Patient/patient" },
      code: { coding: [{ system: "http://snomed.info/sct", code: "44054006" }] },
      onsetDateTime: "2022-01-15",
      abatementDateTime: "2023-06-01",
    };

    const result = buildProblemsSection([condition]);

    expect(result.section).toBeDefined();
    const entry = (result.section as Record<string, unknown>)["entry"] as Record<string, unknown>[];
    const obs = (
      (entry[0]?.["act"] as Record<string, unknown>)["entryRelationship"] as Record<string, unknown>
    )["observation"] as Record<string, unknown>;
    expect(obs["effectiveTime"]).toMatchObject({
      low: { "@value": "20220115" },
      high: { "@value": "20230601" },
    });
  });
});
