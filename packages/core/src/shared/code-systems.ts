// OID <-> URI mapping for the code systems this package resolves. See
// docs/CCDA_FHIR_MAPPING.md#code-systems for the full table and sources.
export const OID_TO_URI: Readonly<Record<string, string>> = {
  "2.16.840.1.113883.6.1": "http://loinc.org",
  "2.16.840.1.113883.6.96": "http://snomed.info/sct",
  "2.16.840.1.113883.6.88": "http://www.nlm.nih.gov/research/umls/rxnorm",
  "2.16.840.1.113883.6.8": "http://unitsofmeasure.org",
  "2.16.840.1.113883.6.90": "http://hl7.org/fhir/sid/icd-10-cm",
  "2.16.840.1.113883.6.103": "http://hl7.org/fhir/sid/icd-9-cm",
  "2.16.840.1.113883.6.12": "http://www.ama-assn.org/go/cpt",
  "2.16.840.1.113883.12.292": "http://hl7.org/fhir/sid/cvx",
  "2.16.840.1.113883.5.1": "http://hl7.org/fhir/administrative-gender",
  "2.16.840.1.113883.5.14": "http://terminology.hl7.org/CodeSystem/v3-ActStatus",
  "2.16.840.1.113883.5.111": "http://terminology.hl7.org/CodeSystem/v3-RoleCode",
};

const URI_TO_OID: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(OID_TO_URI).map(([oid, uri]) => [uri, oid]),
);

export function oidToUri(oid: string): string | undefined {
  return OID_TO_URI[oid];
}

export function uriToOid(uri: string): string | undefined {
  return URI_TO_OID[uri];
}

export const SSN_OID = "2.16.840.1.113883.4.1";
export const US_SSN_SYSTEM = "http://hl7.org/fhir/sid/us-ssn";
