import { oidToUri } from "../../shared/code-systems.js";
import type { CodeableConcept, Coding } from "../../shared/types.js";
import type { CdaNode } from "../parser.js";
import { attr, compact } from "./xml-tree.js";

/** Maps a CDA `code`/`value[xsi:type=CD]` element to a FHIR CodeableConcept.
 * Returns undefined for a `nullFlavor`'d or codeless element rather than an empty
 * CodeableConcept, so callers can tell "no code" from "code present but empty". */
export function cdaCodeToCodeableConcept(node: CdaNode | undefined): CodeableConcept | undefined {
  if (!node || attr(node, "nullFlavor")) return undefined;
  const code = attr(node, "code");
  if (!code) return undefined;

  const oid = attr(node, "codeSystem");
  const system = oid ? oidToUri(oid) : undefined;
  const display = attr(node, "displayName");

  return {
    coding: [compact({ system, code, display }) as Coding],
  };
}
