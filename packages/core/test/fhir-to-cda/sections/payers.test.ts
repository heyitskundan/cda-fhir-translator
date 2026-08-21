import { describe, expect, it } from "vitest";
import { buildPayersSection } from "../../../src/fhir-to-cda/sections/payers.js";
import type { Coverage } from "../../../src/shared/types.js";

describe("buildPayersSection", () => {
  it("builds a Coverage Activity entry with a nested Policy Activity from a Coverage", () => {
    const coverage: Coverage = {
      resourceType: "Coverage",
      id: "coverage-1",
      status: "active",
      beneficiary: { reference: "Patient/patient" },
      type: { coding: [{ code: "HMO" }] },
      payor: [{ display: "Acme Health Plan" }],
    };

    const result = buildPayersSection([coverage]);

    expect(result.section).toBeDefined();
    const entry = (result.section as Record<string, unknown>)["entry"] as Record<
      string,
      unknown
    >[];
    const act = entry[0]?.["act"] as Record<string, unknown>;
    expect(act["templateId"]).toMatchObject({ "@root": "2.16.840.1.113883.10.20.22.4.60" });
    expect(act["statusCode"]).toMatchObject({ "@code": "completed" });
    const entryRelationship = act["entryRelationship"] as Record<string, unknown>;
    const policy = entryRelationship["act"] as Record<string, unknown>;
    expect(policy["templateId"]).toMatchObject({ "@root": "2.16.840.1.113883.10.20.22.4.61" });
    expect(policy["code"]).toMatchObject({ "@code": "HMO" });
    expect(result.mappings).toHaveLength(1);
  });

  it("builds a minimal act when there's no type or payor", () => {
    const coverage: Coverage = {
      resourceType: "Coverage",
      id: "coverage-1",
      status: "active",
      beneficiary: { reference: "Patient/patient" },
    };

    const result = buildPayersSection([coverage]);

    expect(result.section).toBeDefined();
    const entry = (result.section as Record<string, unknown>)["entry"] as Record<
      string,
      unknown
    >[];
    const act = entry[0]?.["act"] as Record<string, unknown>;
    expect(act["entryRelationship"]).toBeUndefined();
  });

  it("returns no section when there are no coverages", () => {
    const result = buildPayersSection([]);
    expect(result.section).toBeUndefined();
    expect(result.mappings).toEqual([]);
  });
});
