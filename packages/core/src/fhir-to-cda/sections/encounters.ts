// Encounters (46240-8). Reverse of cda-to-fhir/sections/encounters.ts — see
// docs/CCDA_FHIR_MAPPING.md.
import type { Encounter } from "../../shared/types.js";
import type { CdaNode } from "../../cda-to-fhir/parser.js";
import { compact } from "../../cda-to-fhir/utils/xml-tree.js";
import { uriToOid } from "../../shared/code-systems.js";
import { fhirDateTimeToHl7Timestamp } from "../utils/dates.js";
import { buildSection, type SectionBuildResult } from "./shared.js";

const ENCOUNTER_ACTIVITY = "2.16.840.1.113883.10.20.22.4.49";

const STATUS_MAP: Record<string, string> = {
  finished: "completed",
  "in-progress": "active",
};

function buildEntry(encounter: Encounter): CdaNode | undefined {
  if (!encounter.class?.code) return undefined;

  return {
    encounter: compact({
      templateId: { "@root": ENCOUNTER_ACTIVITY },
      code: compact({
        "@code": encounter.class.code,
        "@codeSystem": encounter.class.system ? uriToOid(encounter.class.system) : undefined,
        "@displayName": encounter.class.display,
      }),
      statusCode: { "@code": STATUS_MAP[encounter.status] ?? "completed" },
      effectiveTime: compact({
        low: encounter.period?.start
          ? { "@value": fhirDateTimeToHl7Timestamp(encounter.period.start) }
          : undefined,
        high: encounter.period?.end
          ? { "@value": fhirDateTimeToHl7Timestamp(encounter.period.end) }
          : undefined,
      }),
    }),
  } as CdaNode;
}

export function buildEncountersSection(encounters: Encounter[]): SectionBuildResult {
  const entries = encounters
    .map((e) => {
      const node = buildEntry(e);
      return node ? { node, resourceId: e.id ?? "unknown" } : undefined;
    })
    .filter((e): e is { node: CdaNode; resourceId: string } => e !== undefined);

  return buildSection(entries, {
    loincSection: "46240-8",
    sectionTitle: "Encounters",
    fhirResourceType: "Encounter",
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[Encounters]/entry/encounter",
  });
}
