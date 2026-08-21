// Narrative-only sections — reverse of cda-to-fhir/sections/narrative.ts. See
// shared/narrative-sections.ts for the list.
import type { CompositionSection } from "../../shared/types.js";
import { NARRATIVE_SECTIONS } from "../../shared/narrative-sections.js";
import type { CdaNode } from "../../cda-to-fhir/parser.js";
import { compact } from "../../cda-to-fhir/utils/xml-tree.js";

export function buildNarrativeSections(sections: CompositionSection[] | undefined): CdaNode[] {
  if (!sections) return [];

  return sections.map((s) => {
    const loinc = s.code?.coding?.[0]?.code;
    const def = loinc ? NARRATIVE_SECTIONS.find((d) => d.loinc === loinc) : undefined;

    return {
      section: compact({
        templateId: def ? { "@root": def.templateOid } : undefined,
        code: loinc ? { "@code": loinc, "@codeSystem": "2.16.840.1.113883.6.1" } : undefined,
        title: s.title,
        text: s.text,
      }),
    } as CdaNode;
  });
}
