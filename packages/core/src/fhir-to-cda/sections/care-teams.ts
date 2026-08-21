// Care Teams (85847-2). Reverse of cda-to-fhir/sections/care-teams.ts — see
// docs/CCDA_FHIR_MAPPING.md.
import type { CareTeam } from "../../shared/types.js";
import type { CdaNode } from "../../cda-to-fhir/parser.js";
import { compact } from "../../cda-to-fhir/utils/xml-tree.js";
import { buildSection, type SectionBuildResult } from "./shared.js";

const CARE_TEAM_ORGANIZER = "2.16.840.1.113883.10.20.22.4.500";

function buildEntry(careTeam: CareTeam): CdaNode {
  return {
    organizer: compact({
      templateId: { "@root": CARE_TEAM_ORGANIZER },
      statusCode: careTeam.status ? { "@code": careTeam.status } : undefined,
      code: careTeam.name ? { "@displayName": careTeam.name } : undefined,
    }),
  } as CdaNode;
}

export function buildCareTeamsSection(careTeams: CareTeam[]): SectionBuildResult {
  const entries = careTeams.map((c) => ({ node: buildEntry(c), resourceId: c.id ?? "unknown" }));

  return buildSection(entries, {
    loincSection: "85847-2",
    sectionTitle: "Care Teams",
    fhirResourceType: "CareTeam",
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[CareTeams]/entry/organizer",
  });
}
