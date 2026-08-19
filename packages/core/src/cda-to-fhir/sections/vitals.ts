// Vital Signs (8716-3) — same organizer shape as Results (30954-2), but each entry
// becomes an Observation with category=vital-signs directly (no DiagnosticReport).
// See docs/CCDA_FHIR_MAPPING.md.
import type {
  MappingTraceEntry,
  Observation,
  Reference,
  TranslateWarning,
} from "../../shared/types.js";
import type { CdaNode } from "../parser.js";
import { asArray, findByTemplateRoot } from "../utils/xml-tree.js";
import { findSectionByLoinc, type SectionMapResult } from "./shared.js";
import { mapObservation, RESULT_ORGANIZER } from "./results.js";

const VITALS_LOINC = "8716-3";
const SECTION_PATH =
  "ClinicalDocument/component/structuredBody/component/section[VitalSigns]/entry/organizer";
const VITAL_SIGNS_CATEGORY = {
  system: "http://terminology.hl7.org/CodeSystem/observation-category",
  code: "vital-signs",
};

export function mapVitalsSection(root: CdaNode, patientRef: Reference): SectionMapResult {
  const mappings: MappingTraceEntry[] = [];
  const warnings: TranslateWarning[] = [];
  const observations: Observation[] = [];

  const section = findSectionByLoinc(root, VITALS_LOINC);
  if (!section) return { resources: [], mappings, warnings };

  const organizers = findByTemplateRoot(section, RESULT_ORGANIZER);
  if (organizers.length === 0) {
    warnings.push({
      path: SECTION_PATH,
      message: "Vital Signs section present but no entries found",
    });
  }

  organizers.forEach((organizer, i) => {
    const components = asArray(organizer["component"] as CdaNode | CdaNode[] | undefined);
    components.forEach((c, j) => {
      const obsNode = c["observation"] as CdaNode | undefined;
      if (!obsNode) return;
      const obs = mapObservation(
        obsNode,
        `vital-sign-${i + 1}-${j + 1}`,
        patientRef,
        VITAL_SIGNS_CATEGORY,
      );
      if (obs) {
        observations.push(obs);
        mappings.push({
          cdaPath: `${SECTION_PATH}[${i}]/component/observation[${j}]`,
          fhirPath: `Observation/${obs.id}`,
          resourceType: "Observation",
        });
      }
    });
  });

  return { resources: observations, mappings, warnings };
}
