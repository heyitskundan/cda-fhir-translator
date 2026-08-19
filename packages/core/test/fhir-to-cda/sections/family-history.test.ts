import { describe, expect, it } from "vitest";
import { buildFamilyHistorySection } from "../../../src/fhir-to-cda/sections/family-history.js";
import type { FamilyMemberHistory } from "../../../src/shared/types.js";

describe("buildFamilyHistorySection", () => {
  it("builds an organizer entry from a FamilyMemberHistory", () => {
    const fmh: FamilyMemberHistory = {
      resourceType: "FamilyMemberHistory",
      id: "family-member-history-1",
      status: "completed",
      patient: { reference: "Patient/patient" },
      relationship: {
        coding: [{ system: "http://terminology.hl7.org/CodeSystem/v3-RoleCode", code: "MTH" }],
      },
      condition: [{ code: { coding: [{ system: "http://snomed.info/sct", code: "38341003" }] } }],
    };

    const result = buildFamilyHistorySection([fmh]);

    expect(result.section).toBeDefined();
    const entry = (result.section as Record<string, unknown>)["entry"] as Record<
      string,
      unknown
    >[];
    const built = entry[0]?.["organizer"] as Record<string, unknown>;
    expect(built["templateId"]).toMatchObject({ "@root": "2.16.840.1.113883.10.20.22.4.45" });
    const subject = built["subject"] as Record<string, unknown>;
    const relatedSubject = subject["relatedSubject"] as Record<string, unknown>;
    expect(relatedSubject["code"]).toMatchObject({ "@code": "MTH" });
    const component = built["component"] as Record<string, unknown>[];
    expect(component).toHaveLength(1);
    expect(result.mappings).toHaveLength(1);
  });

  it("returns no section when there are no family member histories", () => {
    const result = buildFamilyHistorySection([]);
    expect(result.section).toBeUndefined();
    expect(result.mappings).toEqual([]);
  });

  it("skips a family member history with no relationship code", () => {
    const fmh: FamilyMemberHistory = {
      resourceType: "FamilyMemberHistory",
      id: "family-member-history-1",
      status: "completed",
      patient: { reference: "Patient/patient" },
    };
    const result = buildFamilyHistorySection([fmh]);
    expect(result.section).toBeUndefined();
  });
});
