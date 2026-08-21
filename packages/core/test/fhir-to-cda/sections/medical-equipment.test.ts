import { describe, expect, it } from "vitest";
import { buildMedicalEquipmentSection } from "../../../src/fhir-to-cda/sections/medical-equipment.js";
import type { Device } from "../../../src/shared/types.js";

describe("buildMedicalEquipmentSection", () => {
  it("builds a supply entry from a Device", () => {
    const device: Device = {
      resourceType: "Device",
      id: "device-1",
      status: "completed",
      type: { coding: [{ code: "58938008" }] },
      patient: { reference: "Patient/patient" },
    };

    const result = buildMedicalEquipmentSection([device]);

    expect(result.section).toBeDefined();
    const entry = (result.section as Record<string, unknown>)["entry"] as Record<
      string,
      unknown
    >[];
    const built = entry[0]?.["supply"] as Record<string, unknown>;
    expect(built["templateId"]).toMatchObject({ "@root": "2.16.840.1.113883.10.20.22.4.50" });
    expect(result.mappings).toHaveLength(1);
  });

  it("returns no section when there are no devices", () => {
    const result = buildMedicalEquipmentSection([]);
    expect(result.section).toBeUndefined();
    expect(result.mappings).toEqual([]);
  });

  it("skips a device with no type", () => {
    const device: Device = {
      resourceType: "Device",
      id: "device-1",
      patient: { reference: "Patient/patient" },
    };
    const result = buildMedicalEquipmentSection([device]);
    expect(result.section).toBeUndefined();
  });
});
