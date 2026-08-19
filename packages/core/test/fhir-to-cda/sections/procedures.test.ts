import { describe, expect, it } from "vitest";
import { buildProceduresSection } from "../../../src/fhir-to-cda/sections/procedures.js";
import type { Procedure } from "../../../src/shared/types.js";

describe("buildProceduresSection", () => {
  it("builds a procedure entry from a Procedure", () => {
    const procedure: Procedure = {
      resourceType: "Procedure",
      id: "procedure-1",
      status: "completed",
      subject: { reference: "Patient/patient" },
      code: { coding: [{ system: "http://www.ama-assn.org/go/cpt", code: "44950" }] },
      performedDateTime: "2021-06-10",
    };

    const result = buildProceduresSection([procedure]);

    expect(result.section).toBeDefined();
    const entry = (result.section as Record<string, unknown>)["entry"] as Record<string, unknown>[];
    const built = entry[0]?.["procedure"] as Record<string, unknown>;
    expect(built["templateId"]).toMatchObject({ "@root": "2.16.840.1.113883.10.20.22.4.14" });
    expect(built["statusCode"]).toMatchObject({ "@code": "completed" });
    expect(built["effectiveTime"]).toMatchObject({ "@value": "20210610" });
    expect(result.mappings).toHaveLength(1);
  });

  it("maps FHIR status back to the CDA statusCode vocabulary", () => {
    const procedure: Procedure = {
      resourceType: "Procedure",
      id: "procedure-1",
      status: "not-done",
      subject: { reference: "Patient/patient" },
      code: { coding: [{ code: "44950" }] },
    };

    const result = buildProceduresSection([procedure]);

    const entry = (result.section as Record<string, unknown>)["entry"] as Record<string, unknown>[];
    const built = entry[0]?.["procedure"] as Record<string, unknown>;
    expect(built["statusCode"]).toMatchObject({ "@code": "cancelled" });
  });

  it("returns no section when there are no procedures", () => {
    const result = buildProceduresSection([]);
    expect(result.section).toBeUndefined();
    expect(result.mappings).toEqual([]);
  });

  it("skips a procedure with no code", () => {
    const procedure: Procedure = {
      resourceType: "Procedure",
      id: "procedure-1",
      status: "completed",
      subject: { reference: "Patient/patient" },
    };
    const result = buildProceduresSection([procedure]);
    expect(result.section).toBeUndefined();
  });
});
