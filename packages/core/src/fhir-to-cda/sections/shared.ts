import type { MappingTraceEntry } from "../../shared/types.js";
import type { CdaNode } from "../../cda-to-fhir/parser.js";
import { compact } from "../../cda-to-fhir/utils/xml-tree.js";

export interface SectionBuildResult {
  /** The `<section>` node, or undefined if no matching resources were found. */
  section?: CdaNode;
  mappings: MappingTraceEntry[];
}

export interface SectionBuildOptions {
  loincSection: string;
  sectionTitle: string;
  fhirResourceType: string;
  cdaPath: string;
}

/** Wraps a list of already-built `<entry>` child nodes into a `<section>`, tracking one
 * mapping entry per resource->entry conversion. Mirrors cda-to-fhir/sections/shared.ts's
 * `mapSection`, in reverse. */
export function buildSection(
  entries: { node: CdaNode; resourceId: string }[],
  opts: SectionBuildOptions,
): SectionBuildResult {
  if (entries.length === 0) return { mappings: [] };

  const mappings: MappingTraceEntry[] = entries.map((e, i) => ({
    cdaPath: `${opts.cdaPath}[${i}]`,
    fhirPath: `${opts.fhirResourceType}/${e.resourceId}`,
    resourceType: opts.fhirResourceType,
  }));

  const section = compact({
    code: { "@code": opts.loincSection, "@codeSystem": "2.16.840.1.113883.6.1" },
    title: opts.sectionTitle,
    entry: entries.map((e) => e.node),
  }) as CdaNode;

  return { section, mappings };
}
