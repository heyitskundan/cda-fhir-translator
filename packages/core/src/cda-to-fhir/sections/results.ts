// Results (30954-2). Mapping (see docs/CCDA_FHIR_MAPPING.md):
//   organizer[templateId=...22.4.1]      -> DiagnosticReport
//   code                                  -> DiagnosticReport.code (LOINC)
//   component/observation                 -> Observation[] (referenced)
//     value[@xsi:type=PQ]                 -> Observation.valueQuantity
//     value[@xsi:type=CD]                 -> Observation.valueCodeableConcept
//     referenceRange                      -> Observation.referenceRange
//     interpretationCode                  -> Observation.interpretation
//
// One organizer entry produces two resources (a DiagnosticReport plus its Observation
// children), so this section doesn't use the shared one-entry-to-one-resource
// `mapSection` helper — it walks entries directly instead.
import type {
  DiagnosticReport,
  MappingTraceEntry,
  Observation,
  Reference,
  TranslateWarning,
} from "../../shared/types.js";
import type { CdaNode } from "../parser.js";
import { hl7TimestampToFhirDateTime } from "../utils/dates.js";
import { cdaCodeToCodeableConcept } from "../utils/coding.js";
import { asArray, attr, compact, findByTemplateRoot } from "../utils/xml-tree.js";
import { findSectionByLoinc, type SectionMapResult } from "./shared.js";

export const RESULT_ORGANIZER = "2.16.840.1.113883.10.20.22.4.1";
const RESULTS_LOINC = "30954-2";
const SECTION_PATH =
  "ClinicalDocument/component/structuredBody/component/section[Results]/entry/organizer";

export function mapObservation(
  obsNode: CdaNode,
  id: string,
  patient: Reference,
  category?: { system: string; code: string },
): Observation | undefined {
  const code = cdaCodeToCodeableConcept(obsNode["code"] as CdaNode | undefined);
  if (!code) return undefined;

  const value = obsNode["value"] as CdaNode | undefined;
  const xsiType = attr(value, "xsi:type");
  const valueQuantity =
    xsiType === "PQ"
      ? compact({ value: Number(attr(value, "value")), unit: attr(value, "unit") })
      : undefined;
  const valueCodeableConcept = xsiType === "CD" ? cdaCodeToCodeableConcept(value) : undefined;

  const interpretationCode = cdaCodeToCodeableConcept(
    obsNode["interpretationCode"] as CdaNode | undefined,
  );

  return compact({
    resourceType: "Observation",
    id,
    status: attr(obsNode["statusCode"] as CdaNode | undefined, "code") ?? "final",
    code,
    subject: patient,
    effectiveDateTime: hl7TimestampToFhirDateTime(
      attr(obsNode["effectiveTime"] as CdaNode | undefined, "value"),
    ),
    valueQuantity,
    valueCodeableConcept,
    interpretation: interpretationCode ? [interpretationCode] : undefined,
    category: category
      ? [{ coding: [{ system: category.system, code: category.code }] }]
      : undefined,
  }) as Observation;
}

export function mapResultsSection(root: CdaNode, patientRef: Reference): SectionMapResult {
  const mappings: MappingTraceEntry[] = [];
  const warnings: TranslateWarning[] = [];
  const reports: DiagnosticReport[] = [];
  const observations: Observation[] = [];

  const section = findSectionByLoinc(root, RESULTS_LOINC);
  if (!section) return { resources: [], mappings, warnings };

  const organizers = findByTemplateRoot(section, RESULT_ORGANIZER);
  if (organizers.length === 0) {
    warnings.push({ path: SECTION_PATH, message: "Results section present but no entries found" });
  }

  organizers.forEach((organizer, i) => {
    const reportId = `diagnostic-report-${i + 1}`;
    const code = cdaCodeToCodeableConcept(organizer["code"] as CdaNode | undefined);
    if (!code) {
      warnings.push({ path: `${SECTION_PATH}[${i}]`, message: "Results organizer missing code" });
      return;
    }

    const components = asArray(organizer["component"] as CdaNode | CdaNode[] | undefined);
    const reportObservations: Observation[] = [];
    components.forEach((c, j) => {
      const obsNode = c["observation"] as CdaNode | undefined;
      if (!obsNode) return;
      const obs = mapObservation(obsNode, `${reportId}-obs-${j + 1}`, patientRef, undefined);
      if (obs) {
        reportObservations.push(obs);
        mappings.push({
          cdaPath: `${SECTION_PATH}[${i}]/component/observation[${j}]`,
          fhirPath: `Observation/${obs.id}`,
          resourceType: "Observation",
        });
      }
    });

    const report = compact({
      resourceType: "DiagnosticReport",
      id: reportId,
      status: attr(organizer["statusCode"] as CdaNode | undefined, "code") ?? "final",
      code,
      subject: patientRef,
      result: reportObservations.length
        ? reportObservations.map((o) => ({ reference: `Observation/${o.id}` }))
        : undefined,
    }) as DiagnosticReport;

    reports.push(report);
    observations.push(...reportObservations);
    mappings.push({
      cdaPath: `${SECTION_PATH}[${i}]`,
      fhirPath: `DiagnosticReport/${reportId}`,
      resourceType: "DiagnosticReport",
    });
  });

  return { resources: [...reports, ...observations], mappings, warnings };
}
