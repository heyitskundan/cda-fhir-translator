// Goals (61146-7). Reverse of cda-to-fhir/sections/goals.ts — see
// docs/CCDA_FHIR_MAPPING.md.
import type { Goal } from "../../shared/types.js";
import type { CdaNode } from "../../cda-to-fhir/parser.js";
import { compact } from "../../cda-to-fhir/utils/xml-tree.js";
import { codeableConceptToCdaCode } from "../utils/coding.js";
import { buildSection, type SectionBuildResult } from "./shared.js";

const GOAL_OBSERVATION = "2.16.840.1.113883.10.20.22.4.121";

const STATUS_MAP: Record<string, string> = {
  completed: "completed",
  active: "active",
  cancelled: "cancelled",
};

function buildEntry(goal: Goal): CdaNode | undefined {
  const code = codeableConceptToCdaCode(goal.description);
  if (!code) return undefined;

  return {
    observation: compact({
      templateId: { "@root": GOAL_OBSERVATION },
      statusCode: { "@code": STATUS_MAP[goal.lifecycleStatus] ?? "active" },
      code,
    }),
  } as CdaNode;
}

export function buildGoalsSection(goals: Goal[]): SectionBuildResult {
  const entries = goals
    .map((g) => {
      const node = buildEntry(g);
      return node ? { node, resourceId: g.id ?? "unknown" } : undefined;
    })
    .filter((e): e is { node: CdaNode; resourceId: string } => e !== undefined);

  return buildSection(entries, {
    loincSection: "61146-7",
    sectionTitle: "Goals",
    fhirResourceType: "Goal",
    cdaPath: "ClinicalDocument/component/structuredBody/component/section[Goals]/entry/observation",
  });
}
