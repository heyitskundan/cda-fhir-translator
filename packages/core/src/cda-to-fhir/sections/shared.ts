import type {
  FhirResource,
  MappingTraceEntry,
  Reference,
  TranslateWarning,
} from "../../shared/types.js";
import type { CdaNode } from "../parser.js";
import { asArray, findByTemplateRoot } from "../utils/xml-tree.js";

export interface SectionMapResult {
  resources: FhirResource[];
  mappings: MappingTraceEntry[];
  warnings: TranslateWarning[];
}

export interface SectionMapOptions {
  /** LOINC code identifying this section, for warning/mapping paths only. */
  loincSection: string;
  /** Human-readable section name, for warning/mapping paths only. */
  sectionName: string;
  /** Template root identifying the entry-level act/observation, verified against the
   * C-CDA 2.1 spec. */
  templateRoot: string;
  idPrefix: string;
  cdaPath: string;
  fhirResourceType: string;
  build: (entry: CdaNode, id: string, patientRef: Reference) => FhirResource | undefined;
}

/** Finds the section element (by LOINC `code/@code`) under
 * `component/structuredBody/component/section`, wherever it sits — sections are not
 * guaranteed to be direct children of structuredBody in every document shape. */
export function findSectionByLoinc(root: CdaNode, loincCode: string): CdaNode | undefined {
  const structuredBody = (root["component"] as CdaNode | undefined)?.["structuredBody"] as
    CdaNode | undefined;
  const components = asArray(structuredBody?.["component"] as CdaNode | CdaNode[] | undefined);

  for (const component of components) {
    const section = component["section"] as CdaNode | undefined;
    const code = section?.["code"] as CdaNode | undefined;
    if (code && code["@code"] === loincCode) return section;
  }
  return undefined;
}

/** Finds the section element by its section-level `templateId/@root`, for the handful
 * of sections (e.g. Notes) whose `code` is drawn from a value set rather than one fixed
 * LOINC code, so `findSectionByLoinc` can't be used. */
export function findSectionByTemplateId(root: CdaNode, templateOid: string): CdaNode | undefined {
  const structuredBody = (root["component"] as CdaNode | undefined)?.["structuredBody"] as
    CdaNode | undefined;
  const components = asArray(structuredBody?.["component"] as CdaNode | CdaNode[] | undefined);

  for (const component of components) {
    const section = component["section"] as CdaNode | undefined;
    const templateIds = asArray(section?.["templateId"] as CdaNode | CdaNode[] | undefined);
    if (templateIds.some((t) => t["@root"] === templateOid)) return section;
  }
  return undefined;
}

export function mapSection(
  root: CdaNode,
  patientRef: Reference,
  opts: SectionMapOptions,
): SectionMapResult {
  const mappings: MappingTraceEntry[] = [];
  const warnings: TranslateWarning[] = [];
  const resources: FhirResource[] = [];

  const section = findSectionByLoinc(root, opts.loincSection);
  if (!section) return { resources, mappings, warnings };

  const entries = findByTemplateRoot(section, opts.templateRoot);
  if (entries.length === 0) {
    warnings.push({
      path: `${opts.cdaPath}`,
      message: `${opts.sectionName} section present but no entries found`,
    });
  }

  entries.forEach((entry, i) => {
    const id = `${opts.idPrefix}-${i + 1}`;
    const resource = opts.build(entry, id, patientRef);
    if (!resource) {
      warnings.push({
        path: `${opts.cdaPath}[${i}]`,
        message: `${opts.sectionName} entry could not be mapped (missing required field)`,
      });
      return;
    }
    resources.push(resource);
    mappings.push({
      cdaPath: `${opts.cdaPath}[${i}]`,
      fhirPath: `${opts.fhirResourceType}/${id}`,
      resourceType: opts.fhirResourceType,
    });
  });

  return { resources, mappings, warnings };
}
