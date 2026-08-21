import { describe, expect, it } from "vitest";
import { buildPastMedicalHistorySection } from "../../../src/fhir-to-cda/sections/past-medical-history.js";
import type { Condition } from "../../../src/shared/types.js";

describe("buildPastMedicalHistorySection", () => {
  it("builds an act/observation entry from a Past Medical History Condition", () => {
    const condition: Condition = {
      resourceType: "Condition",
      id: "pmh-1",
      subject: { reference: "Patient/patient" },
      code: { coding: [{ code: "195967001" }] },
      category: [{ text: "Past Medical History" }],
    };

    const result = buildPastMedicalHistorySection([condition]);

    expect(result.section).toBeDefined();
    const entry = (result.section as Record<string, unknown>)["entry"] as Record<
      string,
      unknown
    >[];
    const act = entry[0]?.["act"] as Record<string, unknown>;
    const entryRelationship = act["entryRelationship"] as Record<string, unknown>;
    const obs = entryRelationship["observation"] as Record<string, unknown>;
    expect(obs["templateId"]).toMatchObject({ "@root": "2.16.840.1.113883.10.20.22.4.4" });
    expect(result.mappings).toHaveLength(1);
  });

  it("excludes a plain Problems Condition (no matching category text)", () => {
    const condition: Condition = {
      resourceType: "Condition",
      id: "problem-1",
      subject: { reference: "Patient/patient" },
      code: { coding: [{ code: "x" }] },
    };
    const result = buildPastMedicalHistorySection([condition]);
    expect(result.section).toBeUndefined();
  });

  it("returns no section when there are no conditions", () => {
    const result = buildPastMedicalHistorySection([]);
    expect(result.section).toBeUndefined();
    expect(result.mappings).toEqual([]);
  });
});
