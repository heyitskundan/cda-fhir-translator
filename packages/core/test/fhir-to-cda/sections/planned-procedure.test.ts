import { describe, expect, it } from "vitest";
import { buildPlannedProcedureSection } from "../../../src/fhir-to-cda/sections/planned-procedure.js";
import type { ServiceRequest } from "../../../src/shared/types.js";

describe("buildPlannedProcedureSection", () => {
  it("builds a procedure entry from a plan-intent ServiceRequest with no category", () => {
    const sr: ServiceRequest = {
      resourceType: "ServiceRequest",
      id: "planned-procedure-1",
      status: "active",
      intent: "plan",
      code: { coding: [{ code: "80146002" }] },
      subject: { reference: "Patient/patient" },
      occurrenceDateTime: "2024-06-01",
    };

    const result = buildPlannedProcedureSection([sr]);

    expect(result.section).toBeDefined();
    const entry = (result.section as Record<string, unknown>)["entry"] as Record<
      string,
      unknown
    >[];
    const built = entry[0]?.["procedure"] as Record<string, unknown>;
    expect(built["templateId"]).toMatchObject({ "@root": "2.16.840.1.113883.10.20.22.4.41" });
    expect(result.mappings).toHaveLength(1);
  });

  it("excludes a Plan of Treatment ServiceRequest (has a category tag)", () => {
    const sr: ServiceRequest = {
      resourceType: "ServiceRequest",
      id: "pot-1",
      status: "active",
      intent: "plan",
      code: { coding: [{ code: "x" }] },
      subject: { reference: "Patient/patient" },
      category: [{ text: "Plan of Treatment" }],
    };
    const result = buildPlannedProcedureSection([sr]);
    expect(result.section).toBeUndefined();
  });

  it("returns no section when there are no service requests", () => {
    const result = buildPlannedProcedureSection([]);
    expect(result.section).toBeUndefined();
    expect(result.mappings).toEqual([]);
  });
});
