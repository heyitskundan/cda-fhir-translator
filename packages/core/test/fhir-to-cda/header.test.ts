import { describe, expect, it } from "vitest";
import { buildHeader } from "../../src/fhir-to-cda/header.js";
import { parseCdaXml } from "../../src/cda-to-fhir/parser.js";
import { buildCdaXml } from "../../src/fhir-to-cda/utils/xml.js";
import type { Patient, Practitioner } from "../../src/shared/types.js";

describe("buildHeader (FHIR -> CDA)", () => {
  const patient: Patient = {
    resourceType: "Patient",
    id: "patient",
    identifier: [{ system: "urn:oid:2.16.840.1.113883.19.5", value: "MRN-99000123" }],
    name: [{ given: ["Jamie"], family: "Synthfield" }],
    gender: "female",
    birthDate: "1985-06-04",
  };
  const practitioner: Practitioner = {
    resourceType: "Practitioner",
    id: "practitioner",
    name: [{ given: ["Alex"], family: "Provider" }],
  };

  it("builds a recordTarget/patientRole that re-parses back to the same Patient fields", () => {
    const header = buildHeader({ patient, practitioner });
    const xml = buildCdaXml({ ...header, component: { structuredBody: { component: [] } } });
    const doc = parseCdaXml(xml);

    const patientRole = (doc["recordTarget"] as Record<string, unknown>)["patientRole"] as Record<
      string,
      unknown
    >;
    expect(patientRole["id"]).toMatchObject({
      "@root": "2.16.840.1.113883.19.5",
      "@extension": "MRN-99000123",
    });

    const patientNode = patientRole["patient"] as Record<string, unknown>;
    expect(patientNode["name"]).toMatchObject({ given: "Jamie", family: "Synthfield" });
    expect(patientNode["administrativeGenderCode"]).toMatchObject({ "@code": "F" });
    expect(patientNode["birthTime"]).toMatchObject({ "@value": "19850604" });
  });

  it("builds the author from a Practitioner", () => {
    const header = buildHeader({ patient, practitioner });
    const xml = buildCdaXml({ ...header, component: { structuredBody: { component: [] } } });
    const doc = parseCdaXml(xml);

    const assignedPerson = (
      (doc["author"] as Record<string, unknown>)["assignedAuthor"] as Record<string, unknown>
    )["assignedPerson"] as Record<string, unknown>;
    expect(assignedPerson["name"]).toMatchObject({ given: "Alex", family: "Provider" });
  });

  it("omits author entirely when no Practitioner is given", () => {
    const header = buildHeader({ patient });
    expect(header["author"]).toBeUndefined();
  });

  it("maps an SSN identifier back to the SSN OID, not urn:oid:", () => {
    const ssnPatient: Patient = {
      ...patient,
      identifier: [{ system: "http://hl7.org/fhir/sid/us-ssn", value: "123-45-6789" }],
    };
    const header = buildHeader({ patient: ssnPatient });
    const xml = buildCdaXml({ ...header, component: { structuredBody: { component: [] } } });
    const doc = parseCdaXml(xml);

    const patientRole = (doc["recordTarget"] as Record<string, unknown>)["patientRole"] as Record<
      string,
      unknown
    >;
    expect(patientRole["id"]).toMatchObject({
      "@root": "2.16.840.1.113883.4.1",
      "@extension": "123-45-6789",
    });
  });
});
