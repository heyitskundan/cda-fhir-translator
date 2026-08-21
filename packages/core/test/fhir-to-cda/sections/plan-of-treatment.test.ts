import { describe, expect, it } from "vitest";
import { buildPlanOfTreatmentSection } from "../../../src/fhir-to-cda/sections/plan-of-treatment.js";
import type { ServiceRequest } from "../../../src/shared/types.js";

describe("buildPlanOfTreatmentSection", () => {
  it("builds an observation entry, always as a Planned Observation", () => {
    const sr: ServiceRequest = {
      resourceType: "ServiceRequest",
      id: "pot-1",
      status: "active",
      intent: "plan",
      code: { coding: [{ code: "24606-6" }] },
      subject: { reference: "Patient/patient" },
      category: [{ text: "Plan of Treatment" }],
    };

    const result = buildPlanOfTreatmentSection([sr]);

    expect(result.section).toBeDefined();
    const entry = (result.section as Record<string, unknown>)["entry"] as Record<
      string,
      unknown
    >[];
    const built = entry[0]?.["observation"] as Record<string, unknown>;
    expect(built["templateId"]).toMatchObject({ "@root": "2.16.840.1.113883.10.20.22.4.44" });
    expect(result.mappings).toHaveLength(1);
  });

  it("excludes a Planned Procedure ServiceRequest (no Plan of Treatment category)", () => {
    const sr: ServiceRequest = {
      resourceType: "ServiceRequest",
      id: "planned-procedure-1",
      status: "active",
      intent: "plan",
      code: { coding: [{ code: "x" }] },
      subject: { reference: "Patient/patient" },
    };
    const result = buildPlanOfTreatmentSection([sr]);
    expect(result.section).toBeUndefined();
  });

  it("returns no section when there are no service requests", () => {
    const result = buildPlanOfTreatmentSection([]);
    expect(result.section).toBeUndefined();
    expect(result.mappings).toEqual([]);
  });
});
