// Care Teams (85847-2). Mapping (see docs/CCDA_FHIR_MAPPING.md):
//   entry/organizer[templateId=...22.4.500] -> CareTeam
//   code/@displayName                         -> CareTeam.name
//   statusCode/@code                          -> CareTeam.status
import type { CareTeam, Reference } from "../../shared/types.js";
import type { CdaNode } from "../parser.js";
import { attr, compact } from "../utils/xml-tree.js";
import { mapSection, type SectionMapResult } from "./shared.js";

const CARE_TEAM_ORGANIZER = "2.16.840.1.113883.10.20.22.4.500";

export function mapCareTeamsSection(root: CdaNode, patientRef: Reference): SectionMapResult {
  return mapSection(root, patientRef, {
    loincSection: "85847-2",
    sectionName: "Care Teams",
    templateRoot: CARE_TEAM_ORGANIZER,
    idPrefix: "care-team",
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[CareTeams]/entry/organizer",
    fhirResourceType: "CareTeam",
    build: (organizer, id, patient) => {
      const name = attr(organizer["code"] as CdaNode | undefined, "displayName");
      const status = attr(organizer["statusCode"] as CdaNode | undefined, "code");

      return compact({
        resourceType: "CareTeam",
        id,
        status,
        subject: patient,
        name,
      }) as CareTeam;
    },
  });
}
