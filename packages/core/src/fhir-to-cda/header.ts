import { SSN_OID, US_SSN_SYSTEM } from "../shared/code-systems.js";
import type {
  Address,
  Composition,
  ContactPoint,
  Encounter,
  HumanName,
  Identifier,
  Organization,
  Patient,
  Practitioner,
} from "../shared/types.js";
import type { CdaNode } from "../cda-to-fhir/parser.js";
import { compact } from "../cda-to-fhir/utils/xml-tree.js";
import { fhirDateTimeToHl7Timestamp } from "./utils/dates.js";
import { codeableConceptToCdaCode } from "./utils/coding.js";

// v0.1.0 builds a single fixed document type — Continuity of Care Document — since
// `documentType` selection is deferred (see project roadmap; not tracked in this repo).
const CCD_CODE = { "@code": "34133-9", "@codeSystem": "2.16.840.1.113883.6.1" };

function buildIdentifier(id: Identifier): CdaNode {
  if (id.system === US_SSN_SYSTEM) {
    return compact({ "@root": SSN_OID, "@extension": id.value }) as CdaNode;
  }
  const root = id.system?.startsWith("urn:oid:") ? id.system.slice("urn:oid:".length) : id.system;
  return compact({ "@root": root, "@extension": id.value }) as CdaNode;
}

function buildName(name: HumanName): CdaNode {
  return compact({
    given: name.given?.length === 1 ? name.given[0] : name.given,
    family: name.family,
  }) as CdaNode;
}

function buildAddress(addr: Address): CdaNode {
  return compact({
    streetAddressLine: addr.line?.length === 1 ? addr.line[0] : addr.line,
    city: addr.city,
    state: addr.state,
    postalCode: addr.postalCode,
    country: addr.country,
  }) as CdaNode;
}

function buildTelecom(tel: ContactPoint): CdaNode {
  const prefix = tel.system === "phone" ? "tel:" : tel.system === "email" ? "mailto:" : "";
  return compact({
    "@value": tel.value ? `${prefix}${tel.value}` : undefined,
    "@use": tel.use?.toUpperCase(),
  }) as CdaNode;
}

function genderCode(gender: Patient["gender"]): string | undefined {
  switch (gender) {
    case "male":
      return "M";
    case "female":
      return "F";
    case "unknown":
      return "UN";
    default:
      return undefined;
  }
}

export interface HeaderInput {
  patient: Patient;
  practitioner?: Practitioner;
  organization?: Organization;
  encounter?: Encounter;
  composition?: Composition;
}

/** Builds the ClinicalDocument header fields (everything outside `component`) from the
 * header resources. Reverse of cda-to-fhir/header.ts — see docs/CCDA_FHIR_MAPPING.md. */
export function buildHeader(input: HeaderInput): CdaNode {
  const patientRole = compact({
    id: (input.patient.identifier ?? []).map(buildIdentifier),
    addr: (input.patient.address ?? []).map(buildAddress),
    telecom: (input.patient.telecom ?? []).map(buildTelecom),
    patient: compact({
      name: (input.patient.name ?? []).map(buildName),
      administrativeGenderCode: input.patient.gender
        ? { "@code": genderCode(input.patient.gender) }
        : undefined,
      birthTime: input.patient.birthDate
        ? { "@value": fhirDateTimeToHl7Timestamp(input.patient.birthDate) }
        : undefined,
    }),
  });

  const author = input.practitioner
    ? {
        assignedAuthor: compact({
          id: (input.practitioner.identifier ?? []).map(buildIdentifier),
          assignedPerson: compact({
            name: (input.practitioner.name ?? []).map(buildName),
          }),
        }),
      }
    : undefined;

  const custodian = input.organization
    ? {
        assignedCustodian: {
          representedCustodianOrganization: compact({
            name: input.organization.name,
          }),
        },
      }
    : undefined;

  const componentOf = input.encounter
    ? {
        encompassingEncounter: {
          effectiveTime: compact({
            low: input.encounter.period?.start
              ? { "@value": fhirDateTimeToHl7Timestamp(input.encounter.period.start) }
              : undefined,
            high: input.encounter.period?.end
              ? { "@value": fhirDateTimeToHl7Timestamp(input.encounter.period.end) }
              : undefined,
          }),
        },
      }
    : undefined;

  const docCode = input.composition
    ? (codeableConceptToCdaCode(input.composition.type) ?? CCD_CODE)
    : CCD_CODE;

  return compact({
    typeId: { "@root": "2.16.840.1.113883.1.3", "@extension": "POCD_HD000040" },
    templateId: { "@root": "2.16.840.1.113883.10.20.22.1.2" },
    code: docCode,
    effectiveTime: input.composition?.date
      ? { "@value": fhirDateTimeToHl7Timestamp(input.composition.date) }
      : undefined,
    confidentialityCode: input.composition?.confidentiality
      ? { "@code": input.composition.confidentiality }
      : undefined,
    recordTarget: { patientRole },
    author: author,
    custodian: custodian,
    componentOf: componentOf,
  }) as CdaNode;
}
