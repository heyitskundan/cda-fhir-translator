// Narrative-only sections — see shared/narrative-sections.ts for the list and why these
// 38 sections are handled generically instead of one file per section.
import type { CompositionSection } from "../../shared/types.js";
import { NARRATIVE_SECTIONS } from "../../shared/narrative-sections.js";
import type { CdaNode } from "../parser.js";
import { asArray, compact } from "../utils/xml-tree.js";
import { findSectionByLoinc } from "./shared.js";

/** Flattens a possibly mixed-content `text` element (paragraphs, lists, tables) down to
 * plain text — nested markup isn't preserved on a roundtrip, only its text content. */
function extractText(node: unknown): string | undefined {
  if (typeof node === "string") return node.trim() || undefined;
  if (node === null || typeof node !== "object") return undefined;

  const obj = node as CdaNode;
  const parts: string[] = [];
  for (const key of Object.keys(obj)) {
    if (key.startsWith("@")) continue;
    if (key === "#text") {
      if (typeof obj[key] === "string") parts.push(obj[key] as string);
      continue;
    }
    for (const child of asArray(obj[key] as CdaNode | CdaNode[] | undefined)) {
      const text = extractText(child);
      if (text) parts.push(text);
    }
  }
  return parts.length ? parts.join(" ").replace(/\s+/g, " ").trim() : undefined;
}

export function mapNarrativeSections(root: CdaNode): CompositionSection[] {
  const sections: CompositionSection[] = [];

  for (const def of NARRATIVE_SECTIONS) {
    const section = findSectionByLoinc(root, def.loinc);
    if (!section) continue;

    const title = typeof section["title"] === "string" ? (section["title"] as string) : def.name;
    const text = extractText(section["text"]);

    sections.push(
      compact({
        title,
        code: { coding: [{ system: "http://loinc.org", code: def.loinc, display: def.name }] },
        text,
      }) as CompositionSection,
    );
  }

  return sections;
}
