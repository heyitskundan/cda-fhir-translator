// Results (30954-2). Reverse of cda-to-fhir/sections/results.ts — see
// docs/CCDA_FHIR_MAPPING.md.
import type { DiagnosticReport, Observation } from "../../shared/types.js";
import type { CdaNode } from "../../cda-to-fhir/parser.js";
import { compact } from "../../cda-to-fhir/utils/xml-tree.js";
import { RESULT_ORGANIZER } from "../../cda-to-fhir/sections/results.js";
import { fhirDateTimeToHl7Timestamp } from "../utils/dates.js";
import { codeableConceptToCdaCode } from "../utils/coding.js";
import { buildSection, type SectionBuildResult } from "./shared.js";

export function buildObservationEntry(obs: Observation): CdaNode | undefined {
  const code = codeableConceptToCdaCode(obs.code);
  if (!code) return undefined;

  const value = obs.valueQuantity
    ? compact({
        "@xsi:type": "PQ",
        "@value":
          obs.valueQuantity.value !== undefined ? String(obs.valueQuantity.value) : undefined,
        "@unit": obs.valueQuantity.unit,
      })
    : obs.valueCodeableConcept
      ? { "@xsi:type": "CD", ...codeableConceptToCdaCode(obs.valueCodeableConcept) }
      : undefined;

  return compact({
    code,
    statusCode: { "@code": obs.status },
    effectiveTime: obs.effectiveDateTime
      ? { "@value": fhirDateTimeToHl7Timestamp(obs.effectiveDateTime) }
      : undefined,
    value,
    interpretationCode: obs.interpretation?.[0]
      ? codeableConceptToCdaCode(obs.interpretation[0])
      : undefined,
  }) as CdaNode;
}

export function buildResultsSection(
  reports: DiagnosticReport[],
  observations: Observation[],
): SectionBuildResult {
  const byId = new Map(observations.map((o) => [o.id, o]));

  const entries = reports
    .map((report) => {
      const code = codeableConceptToCdaCode(report.code);
      if (!code) return undefined;

      const resultObs = (report.result ?? [])
        .map((ref) => byId.get(ref.reference?.split("/")[1]))
        .filter((o): o is Observation => o !== undefined)
        .map(buildObservationEntry)
        .filter((o): o is CdaNode => o !== undefined);

      const node = {
        organizer: compact({
          templateId: { "@root": RESULT_ORGANIZER },
          code,
          statusCode: { "@code": report.status },
          component: resultObs.map((observation) => ({ observation })),
        }),
      } as CdaNode;

      return { node, resourceId: report.id ?? "unknown" };
    })
    .filter((e): e is { node: CdaNode; resourceId: string } => e !== undefined);

  return buildSection(entries, {
    loincSection: "30954-2",
    sectionTitle: "Results",
    fhirResourceType: "DiagnosticReport",
    cdaPath: "ClinicalDocument/component/structuredBody/component/section[Results]/entry/organizer",
  });
}
