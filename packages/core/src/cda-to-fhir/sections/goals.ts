// Goals (61146-7). Mapping (see docs/CCDA_FHIR_MAPPING.md):
//   entry/observation[templateId=...22.4.121] -> Goal
//   code                                        -> Goal.description
//   statusCode/@code                            -> Goal.lifecycleStatus
import type { Goal, Reference } from "../../shared/types.js";
import type { CdaNode } from "../parser.js";
import { cdaCodeToCodeableConcept } from "../utils/coding.js";
import { attr, compact } from "../utils/xml-tree.js";
import { mapSection, type SectionMapResult } from "./shared.js";

const GOAL_OBSERVATION = "2.16.840.1.113883.10.20.22.4.121";

const STATUS_MAP: Record<string, Goal["lifecycleStatus"]> = {
  completed: "completed",
  active: "active",
  aborted: "cancelled",
  cancelled: "cancelled",
};

export function mapGoalsSection(root: CdaNode, patientRef: Reference): SectionMapResult {
  return mapSection(root, patientRef, {
    loincSection: "61146-7",
    sectionName: "Goals",
    templateRoot: GOAL_OBSERVATION,
    idPrefix: "goal",
    cdaPath: "ClinicalDocument/component/structuredBody/component/section[Goals]/entry/observation",
    fhirResourceType: "Goal",
    build: (obs, id, patient) => {
      const description = cdaCodeToCodeableConcept(obs["code"] as CdaNode | undefined);
      if (!description) return undefined;

      const statusCode = attr(obs["statusCode"] as CdaNode | undefined, "code");

      return compact({
        resourceType: "Goal",
        id,
        lifecycleStatus: (statusCode && STATUS_MAP[statusCode]) ?? "active",
        description,
        subject: patient,
      }) as Goal;
    },
  });
}
