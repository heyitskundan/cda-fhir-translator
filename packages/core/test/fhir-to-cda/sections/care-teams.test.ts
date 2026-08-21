import { describe, expect, it } from "vitest";
import { buildCareTeamsSection } from "../../../src/fhir-to-cda/sections/care-teams.js";
import type { CareTeam } from "../../../src/shared/types.js";

describe("buildCareTeamsSection", () => {
  it("builds an organizer entry from a CareTeam", () => {
    const careTeam: CareTeam = {
      resourceType: "CareTeam",
      id: "care-team-1",
      status: "active",
      subject: { reference: "Patient/patient" },
      name: "Diabetes Care Team",
    };

    const result = buildCareTeamsSection([careTeam]);

    expect(result.section).toBeDefined();
    const entry = (result.section as Record<string, unknown>)["entry"] as Record<
      string,
      unknown
    >[];
    const built = entry[0]?.["organizer"] as Record<string, unknown>;
    expect(built["templateId"]).toMatchObject({ "@root": "2.16.840.1.113883.10.20.22.4.500" });
    expect(built["statusCode"]).toMatchObject({ "@code": "active" });
    expect(built["code"]).toMatchObject({ "@displayName": "Diabetes Care Team" });
    expect(result.mappings).toHaveLength(1);
  });

  it("returns no section when there are no care teams", () => {
    const result = buildCareTeamsSection([]);
    expect(result.section).toBeUndefined();
    expect(result.mappings).toEqual([]);
  });
});
