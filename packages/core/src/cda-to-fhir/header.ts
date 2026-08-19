import { SSN_OID, US_SSN_SYSTEM } from "../shared/code-systems.js";
import type {
  Address,
  Composition,
  ContactPoint,
  Encounter,
  HumanName,
  Identifier,
  MappingTraceEntry,
  Organization,
  Patient,
  Practitioner,
  Reference,
  TranslateWarning,
} from "../shared/types.js";
import type { CdaNode } from "./parser.js";
import { hl7TimestampToFhirDate, hl7TimestampToFhirDateTime } from "./utils/dates.js";
import { cdaCodeToCodeableConcept } from "./utils/coding.js";
import { asArray, attr, compact } from "./utils/xml-tree.js";

export interface HeaderResult {
  patient: Patient;
  practitioner?: Practitioner;
  organization?: Organization;
  encounter?: Encounter;
  composition: Composition;
  mappings: MappingTraceEntry[];
  warnings: TranslateWarning[];
}

function mapGender(code: string | undefined): Patient["gender"] {
  switch (code) {
    case "M":
      return "male";
    case "F":
      return "female";
    case "UN":
      return "unknown";
    default:
      return undefined;
  }
}

function mapIdentifier(id: CdaNode): Identifier | undefined {
  const root = attr(id, "root");
  const value = attr(id, "extension");
  if (!value) return undefined;
  const system = root === SSN_OID ? US_SSN_SYSTEM : root ? `urn:oid:${root}` : undefined;
  return compact({ system, value }) as Identifier;
}

function mapName(name: CdaNode): HumanName {
  const given = asArray(name["given"] as string | string[] | undefined).map(String);
  const family = typeof name["family"] === "string" ? (name["family"] as string) : undefined;
  return compact({ given: given.length ? given : undefined, family }) as HumanName;
}

function mapAddress(addr: CdaNode): Address {
  const line = asArray(addr["streetAddressLine"] as string | string[] | undefined).map(String);
  return compact({
    line: line.length ? line : undefined,
    city: typeof addr["city"] === "string" ? (addr["city"] as string) : undefined,
    state: typeof addr["state"] === "string" ? (addr["state"] as string) : undefined,
    postalCode: typeof addr["postalCode"] === "string" ? (addr["postalCode"] as string) : undefined,
    country: typeof addr["country"] === "string" ? (addr["country"] as string) : undefined,
  }) as Address;
}

function mapTelecom(tel: CdaNode): ContactPoint {
  const raw = attr(tel, "value") ?? "";
  const system = raw.startsWith("tel:") ? "phone" : raw.startsWith("mailto:") ? "email" : undefined;
  const value = raw.replace(/^tel:|^mailto:/, "");
  const use = attr(tel, "use")?.toLowerCase();
  return compact({ system, value: value || undefined, use }) as ContactPoint;
}

/** Maps the ClinicalDocument header — recordTarget, author, custodian,
 * componentOf/encompassingEncounter — to Patient/Practitioner/Organization/Encounter/
 * Composition. See docs/CCDA_FHIR_MAPPING.md for the field-level table. */
export function mapHeader(root: CdaNode): HeaderResult {
  const mappings: MappingTraceEntry[] = [];
  const warnings: TranslateWarning[] = [];

  const recordTarget = asArray(root["recordTarget"] as CdaNode | CdaNode[] | undefined)[0];
  const patientRole = recordTarget?.["patientRole"] as CdaNode | undefined;
  if (!patientRole) {
    warnings.push({
      path: "ClinicalDocument/recordTarget/patientRole",
      message: "Missing patientRole — Patient resource could not be built",
    });
  }

  const identifiers = asArray(patientRole?.["id"] as CdaNode | CdaNode[] | undefined)
    .map(mapIdentifier)
    .filter((i): i is Identifier => i !== undefined);

  const patientNode = patientRole?.["patient"] as CdaNode | undefined;
  const names = asArray(patientNode?.["name"] as CdaNode | CdaNode[] | undefined).map(mapName);
  const addresses = asArray(patientRole?.["addr"] as CdaNode | CdaNode[] | undefined).map(
    mapAddress,
  );
  const telecoms = asArray(patientRole?.["telecom"] as CdaNode | CdaNode[] | undefined).map(
    mapTelecom,
  );
  const genderCode = attr(patientNode?.["administrativeGenderCode"] as CdaNode | undefined, "code");
  const birthTime = attr(patientNode?.["birthTime"] as CdaNode | undefined, "value");

  const patient = compact({
    resourceType: "Patient",
    id: "patient",
    identifier: identifiers.length ? identifiers : undefined,
    name: names.length ? names : undefined,
    gender: mapGender(genderCode),
    birthDate: hl7TimestampToFhirDate(birthTime),
    address: addresses.length ? addresses : undefined,
    telecom: telecoms.length ? telecoms : undefined,
  }) as Patient;
  mappings.push({
    cdaPath: "ClinicalDocument/recordTarget/patientRole",
    fhirPath: "Patient/patient",
    resourceType: "Patient",
  });
  const patientRef: Reference = { reference: "Patient/patient" };

  // Practitioner (author)
  const author = asArray(root["author"] as CdaNode | CdaNode[] | undefined)[0];
  const assignedAuthor = author?.["assignedAuthor"] as CdaNode | undefined;
  let practitioner: Practitioner | undefined;
  if (assignedAuthor) {
    const authorNames = asArray(
      (assignedAuthor["assignedPerson"] as CdaNode | undefined)?.["name"] as
        CdaNode | CdaNode[] | undefined,
    ).map(mapName);
    const authorIds = asArray(assignedAuthor["id"] as CdaNode | CdaNode[] | undefined)
      .map(mapIdentifier)
      .filter((i): i is Identifier => i !== undefined);
    practitioner = compact({
      resourceType: "Practitioner",
      id: "practitioner",
      identifier: authorIds.length ? authorIds : undefined,
      name: authorNames.length ? authorNames : undefined,
    }) as Practitioner;
    mappings.push({
      cdaPath: "ClinicalDocument/author/assignedAuthor",
      fhirPath: "Practitioner/practitioner",
      resourceType: "Practitioner",
    });
  }

  // Organization (custodian)
  const custodianOrg = (
    (root["custodian"] as CdaNode | undefined)?.["assignedCustodian"] as CdaNode | undefined
  )?.["representedCustodianOrganization"] as CdaNode | undefined;
  let organization: Organization | undefined;
  if (custodianOrg) {
    const orgName =
      typeof custodianOrg["name"] === "string" ? (custodianOrg["name"] as string) : undefined;
    organization = compact({
      resourceType: "Organization",
      id: "organization",
      name: orgName,
    }) as Organization;
    mappings.push({
      cdaPath: "ClinicalDocument/custodian/assignedCustodian/representedCustodianOrganization",
      fhirPath: "Organization/organization",
      resourceType: "Organization",
    });
  }

  // Encounter (componentOf/encompassingEncounter)
  const encompassingEncounter = (root["componentOf"] as CdaNode | undefined)?.[
    "encompassingEncounter"
  ] as CdaNode | undefined;
  let encounter: Encounter | undefined;
  if (encompassingEncounter) {
    const effectiveTime = encompassingEncounter["effectiveTime"] as CdaNode | undefined;
    const start = hl7TimestampToFhirDateTime(
      attr(effectiveTime, "value") ?? attr(effectiveTime?.["low"] as CdaNode | undefined, "value"),
    );
    const end = hl7TimestampToFhirDateTime(
      attr(effectiveTime?.["high"] as CdaNode | undefined, "value"),
    );
    encounter = compact({
      resourceType: "Encounter",
      id: "encounter",
      status: "finished",
      subject: patientRef,
      period: start || end ? compact({ start, end }) : undefined,
    }) as Encounter;
    mappings.push({
      cdaPath: "ClinicalDocument/componentOf/encompassingEncounter",
      fhirPath: "Encounter/encounter",
      resourceType: "Encounter",
    });
  }

  // Composition
  const docCode = root["code"] as CdaNode | undefined;
  const compositionType = cdaCodeToCodeableConcept(docCode) ?? { text: "Unknown document type" };
  const composition = compact({
    resourceType: "Composition",
    id: "composition",
    status: "final",
    type: compositionType,
    subject: patientRef,
    date: hl7TimestampToFhirDateTime(attr(root["effectiveTime"] as CdaNode | undefined, "value")),
    author: practitioner ? [{ reference: "Practitioner/practitioner" }] : undefined,
    confidentiality: attr(root["confidentialityCode"] as CdaNode | undefined, "code"),
    custodian: organization ? { reference: "Organization/organization" } : undefined,
    encounter: encounter ? { reference: "Encounter/encounter" } : undefined,
  }) as Composition;
  mappings.push({
    cdaPath: "ClinicalDocument",
    fhirPath: "Composition/composition",
    resourceType: "Composition",
  });

  return compact({
    patient,
    practitioner,
    organization,
    encounter,
    composition,
    mappings,
    warnings,
  }) as HeaderResult;
}
