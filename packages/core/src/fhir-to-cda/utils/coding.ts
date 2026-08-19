import { uriToOid } from "../../shared/code-systems.js";
import type { CodeableConcept } from "../../shared/types.js";
import type { CdaNode } from "../../cda-to-fhir/parser.js";
import { compact } from "../../cda-to-fhir/utils/xml-tree.js";

/** Maps a FHIR CodeableConcept back to a CDA `code`-shaped element. Uses the first
 * coding — this package doesn't merge multiple codings from different systems into one
 * CDA `code`/`translation` pair. Returns undefined for an empty CodeableConcept. */
export function codeableConceptToCdaCode(
  concept: CodeableConcept | undefined,
): CdaNode | undefined {
  const coding = concept?.coding?.[0];
  if (!coding?.code) return undefined;

  const codeSystem = coding.system ? uriToOid(coding.system) : undefined;

  return compact({
    "@code": coding.code,
    "@codeSystem": codeSystem,
    "@displayName": coding.display,
  }) as CdaNode;
}
