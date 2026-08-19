import { describe, expect, it } from "vitest";
import { buildImmunizationsSection } from "../../../src/fhir-to-cda/sections/immunizations.js";
import type { Immunization } from "../../../src/shared/types.js";

describe("buildImmunizationsSection", () => {
  it("builds a substanceAdministration entry from an Immunization", () => {
    const immunization: Immunization = {
      resourceType: "Immunization",
      id: "immunization-1",
      status: "completed",
      patient: { reference: "Patient/patient" },
      vaccineCode: { coding: [{ system: "http://hl7.org/fhir/sid/cvx", code: "140" }] },
      occurrenceDateTime: "2022-01-15",
    };

    const result = buildImmunizationsSection([immunization]);

    expect(result.section).toBeDefined();
    const entry = (result.section as Record<string, unknown>)["entry"] as Record<
      string,
      unknown
    >[];
    const built = entry[0]?.["substanceAdministration"] as Record<string, unknown>;
    expect(built["templateId"]).toMatchObject({ "@root": "2.16.840.1.113883.10.20.22.4.52" });
    expect(built["statusCode"]).toMatchObject({ "@code": "completed" });
    expect(result.mappings).toHaveLength(1);
  });

  it("returns no section when there are no immunizations", () => {
    const result = buildImmunizationsSection([]);
    expect(result.section).toBeUndefined();
    expect(result.mappings).toEqual([]);
  });

  it("skips an immunization with no vaccine code", () => {
    const immunization: Immunization = {
      resourceType: "Immunization",
      id: "immunization-1",
      status: "completed",
      patient: { reference: "Patient/patient" },
      vaccineCode: {},
    };
    const result = buildImmunizationsSection([immunization]);
    expect(result.section).toBeUndefined();
  });
});
