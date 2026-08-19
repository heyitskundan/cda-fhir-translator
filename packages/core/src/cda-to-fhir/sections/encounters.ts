// Encounters (46240-8). Mapping (see docs/CCDA_FHIR_MAPPING.md):
//   entry/encounter[templateId=...22.4.49] -> Encounter
//   code                                     -> Encounter.class
//   statusCode/@code                         -> Encounter.status
//   effectiveTime/@value or low/high         -> Encounter.period
//
// Distinct from the header's componentOf/encompassingEncounter (see header.ts), which
// maps the single encounter the whole document is about. This section maps individual
// encounter activities referenced elsewhere in the document body.
import type { Encounter, Reference } from "../../shared/types.js";
import type { CdaNode } from "../parser.js";
import { hl7TimestampToFhirDateTime } from "../utils/dates.js";
import { oidToUri } from "../../shared/code-systems.js";
import { attr, compact } from "../utils/xml-tree.js";
import { mapSection, type SectionMapResult } from "./shared.js";

const ENCOUNTER_ACTIVITY = "2.16.840.1.113883.10.20.22.4.49";

const STATUS_MAP: Record<string, Encounter["status"]> = {
  completed: "finished",
  active: "in-progress",
};

export function mapEncountersSection(root: CdaNode, patientRef: Reference): SectionMapResult {
  return mapSection(root, patientRef, {
    loincSection: "46240-8",
    sectionName: "Encounters",
    templateRoot: ENCOUNTER_ACTIVITY,
    idPrefix: "encounter",
    cdaPath: "ClinicalDocument/component/structuredBody/component/section[Encounters]/entry/encounter",
    fhirResourceType: "Encounter",
    build: (enc, id, patient) => {
      const codeNode = enc["code"] as CdaNode | undefined;
      const code = attr(codeNode, "code");
      if (!code) return undefined;

      const oid = attr(codeNode, "codeSystem");
      const classCoding = compact({
        system: oid ? oidToUri(oid) : undefined,
        code,
        display: attr(codeNode, "displayName"),
      });

      const statusCode = attr(enc["statusCode"] as CdaNode | undefined, "code");
      const effectiveTime = enc["effectiveTime"] as CdaNode | undefined;
      const start = hl7TimestampToFhirDateTime(
        attr(effectiveTime, "value") ??
          attr(effectiveTime?.["low"] as CdaNode | undefined, "value"),
      );
      const end = hl7TimestampToFhirDateTime(
        attr(effectiveTime?.["high"] as CdaNode | undefined, "value"),
      );

      return compact({
        resourceType: "Encounter",
        id,
        status: (statusCode && STATUS_MAP[statusCode]) ?? "unknown",
        class: classCoding,
        subject: patient,
        period: start || end ? compact({ start, end }) : undefined,
      }) as Encounter;
    },
  });
}
