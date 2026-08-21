import { describe, expect, it } from "vitest";
import { buildAdvanceDirectivesSection } from "../../../src/fhir-to-cda/sections/advance-directives.js";
import type { Consent } from "../../../src/shared/types.js";

describe("buildAdvanceDirectivesSection", () => {
  it("builds an observation entry from a Consent", () => {
    const consent: Consent = {
      resourceType: "Consent",
      id: "consent-1",
      status: "active",
      subject: { reference: "Patient/patient" },
      category: [{ coding: [{ code: "304251008" }] }],
    };

    const result = buildAdvanceDirectivesSection([consent]);

    expect(result.section).toBeDefined();
    const entry = (result.section as Record<string, unknown>)["entry"] as Record<
      string,
      unknown
    >[];
    const built = entry[0]?.["observation"] as Record<string, unknown>;
    expect(built["templateId"]).toMatchObject({ "@root": "2.16.840.1.113883.10.20.22.4.48" });
    expect(built["statusCode"]).toMatchObject({ "@code": "completed" });
    expect(result.mappings).toHaveLength(1);
  });

  it("returns no section when there are no consents", () => {
    const result = buildAdvanceDirectivesSection([]);
    expect(result.section).toBeUndefined();
    expect(result.mappings).toEqual([]);
  });

  it("skips a consent with no category", () => {
    const consent: Consent = {
      resourceType: "Consent",
      id: "consent-1",
      status: "active",
      subject: { reference: "Patient/patient" },
    };
    const result = buildAdvanceDirectivesSection([consent]);
    expect(result.section).toBeUndefined();
  });
});
