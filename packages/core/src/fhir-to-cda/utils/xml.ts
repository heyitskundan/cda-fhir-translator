import { XMLBuilder } from "fast-xml-parser";
import type { CdaNode } from "../../cda-to-fhir/parser.js";

const builder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: "@",
  textNodeName: "#text",
  format: true,
  suppressEmptyNode: true,
});

/** Serializes a `ClinicalDocument` node (same shape `parseCdaXml` produces) back to
 * C-CDA XML, with the standard header and namespace declarations. */
export function buildCdaXml(clinicalDocument: CdaNode): string {
  const withNamespace = {
    "@xmlns": "urn:hl7-org:v3",
    "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    ...clinicalDocument,
  };
  return `<?xml version="1.0" encoding="UTF-8"?>\n${builder.build({ ClinicalDocument: withNamespace })}`;
}
