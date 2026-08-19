import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseCdaXml } from "../src/cda-to-fhir/parser.js";
import { mapHeader } from "../src/cda-to-fhir/header.js";

const ccdFixture = readFileSync(
  fileURLToPath(new URL("./fixtures/cda/ccd-synthetic.xml", import.meta.url)),
  "utf8",
);

describe("mapHeader", () => {
  const doc = parseCdaXml(ccdFixture);
  const result = mapHeader(doc);

  it("maps patientRole to a Patient resource", () => {
    expect(result.patient).toMatchObject({
      resourceType: "Patient",
      id: "patient",
      gender: "female",
      birthDate: "1985-06-04",
    });
    expect(result.patient.name).toEqual([{ given: ["Jamie"], family: "Synthfield" }]);
    expect(result.patient.identifier).toEqual([
      { system: "urn:oid:2.16.840.1.113883.19.5", value: "MRN-99000123" },
    ]);
  });

  it("maps the author to a Practitioner resource", () => {
    expect(result.practitioner).toMatchObject({
      resourceType: "Practitioner",
      name: [{ given: ["Alex"], family: "Provider" }],
    });
  });

  it("maps the custodian to an Organization resource", () => {
    expect(result.organization).toMatchObject({
      resourceType: "Organization",
      name: "Synthetic Regional Health",
    });
  });

  it("maps componentOf/encompassingEncounter to an Encounter resource", () => {
    expect(result.encounter).toMatchObject({
      resourceType: "Encounter",
      status: "finished",
      period: { start: "2024-01-09T08:00:00-05:00", end: "2024-01-10T09:00:00-05:00" },
    });
  });

  it("maps ClinicalDocument to a Composition resource", () => {
    expect(result.composition).toMatchObject({
      resourceType: "Composition",
      status: "final",
      date: "2024-01-10T09:00:00-05:00",
      confidentiality: "N",
    });
    expect(result.composition.type.coding?.[0]).toMatchObject({ code: "34133-9" });
  });

  it("never puts a PHI value in a mapping trail path", () => {
    for (const m of result.mappings) {
      expect(m.cdaPath).not.toMatch(/Synthfield|Jamie|MRN-99000123/);
    }
  });
});
