import { describe, expect, it } from "vitest";
import { buildGoalsSection } from "../../../src/fhir-to-cda/sections/goals.js";
import type { Goal } from "../../../src/shared/types.js";

describe("buildGoalsSection", () => {
  it("builds an observation entry from a Goal", () => {
    const goal: Goal = {
      resourceType: "Goal",
      id: "goal-1",
      lifecycleStatus: "active",
      description: { coding: [{ code: "target-a1c" }] },
      subject: { reference: "Patient/patient" },
    };

    const result = buildGoalsSection([goal]);

    expect(result.section).toBeDefined();
    const entry = (result.section as Record<string, unknown>)["entry"] as Record<
      string,
      unknown
    >[];
    const built = entry[0]?.["observation"] as Record<string, unknown>;
    expect(built["templateId"]).toMatchObject({ "@root": "2.16.840.1.113883.10.20.22.4.121" });
    expect(built["statusCode"]).toMatchObject({ "@code": "active" });
    expect(result.mappings).toHaveLength(1);
  });

  it("returns no section when there are no goals", () => {
    const result = buildGoalsSection([]);
    expect(result.section).toBeUndefined();
    expect(result.mappings).toEqual([]);
  });

  it("skips a goal with no description code", () => {
    const goal: Goal = {
      resourceType: "Goal",
      id: "goal-1",
      lifecycleStatus: "active",
      description: {},
      subject: { reference: "Patient/patient" },
    };
    const result = buildGoalsSection([goal]);
    expect(result.section).toBeUndefined();
  });
});
