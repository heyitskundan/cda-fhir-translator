import { describe, expect, it } from "vitest";
import { buildEncountersSection } from "../../../src/fhir-to-cda/sections/encounters.js";
import type { Encounter } from "../../../src/shared/types.js";

describe("buildEncountersSection", () => {
  it("builds an encounter entry from an Encounter", () => {
    const encounter: Encounter = {
      resourceType: "Encounter",
      id: "encounter-1",
      status: "finished",
      class: { code: "99213", display: "Office visit" },
      subject: { reference: "Patient/patient" },
      period: { start: "2022-03-01", end: "2022-03-01" },
    };

    const result = buildEncountersSection([encounter]);

    expect(result.section).toBeDefined();
    const entry = (result.section as Record<string, unknown>)["entry"] as Record<
      string,
      unknown
    >[];
    const built = entry[0]?.["encounter"] as Record<string, unknown>;
    expect(built["templateId"]).toMatchObject({ "@root": "2.16.840.1.113883.10.20.22.4.49" });
    expect(built["code"]).toMatchObject({ "@code": "99213" });
    expect(built["statusCode"]).toMatchObject({ "@code": "completed" });
    expect(result.mappings).toHaveLength(1);
  });

  it("returns no section when there are no encounters", () => {
    const result = buildEncountersSection([]);
    expect(result.section).toBeUndefined();
    expect(result.mappings).toEqual([]);
  });

  it("skips an encounter with no class code", () => {
    const encounter: Encounter = {
      resourceType: "Encounter",
      id: "encounter-1",
      status: "finished",
      subject: { reference: "Patient/patient" },
    };
    const result = buildEncountersSection([encounter]);
    expect(result.section).toBeUndefined();
  });
});
