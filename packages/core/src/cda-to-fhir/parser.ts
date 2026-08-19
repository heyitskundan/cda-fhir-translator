import { XMLParser, XMLValidator } from "fast-xml-parser";
import { TranslateError } from "../shared/errors.js";

// A parsed C-CDA element. Deliberately loose — the mapping code narrows fields it
// reads, per section, rather than modeling the full C-CDA schema.
export type CdaNode = Record<string, unknown>;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@",
  textNodeName: "#text",
  parseAttributeValue: false, // keep all values as strings — PHI safety, no coercion surprises
  trimValues: true,
});

/** Parses a C-CDA XML document into its `ClinicalDocument` root node. */
export function parseCdaXml(xml: string): CdaNode {
  const validation = XMLValidator.validate(xml);
  if (validation !== true) {
    throw new TranslateError(
      "Failed to parse C-CDA XML: not well-formed",
      "PARSE_ERROR",
      "ClinicalDocument",
    );
  }

  let parsed: unknown;
  try {
    parsed = parser.parse(xml);
  } catch (cause) {
    throw new TranslateError(
      "Failed to parse C-CDA XML",
      "PARSE_ERROR",
      "ClinicalDocument",
      cause instanceof Error ? cause : undefined,
    );
  }

  const root = parsed as CdaNode;
  const doc = root["ClinicalDocument"];
  if (!doc || typeof doc !== "object") {
    throw new TranslateError(
      "Missing root ClinicalDocument element",
      "PARSE_ERROR",
      "ClinicalDocument",
    );
  }
  return doc as CdaNode;
}
