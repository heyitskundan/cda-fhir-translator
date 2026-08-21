// Advance Directives (42348-3). Mapping (see docs/CCDA_FHIR_MAPPING.md):
//   entry/.../observation[templateId=...22.4.48] -> Consent
//   code                                           -> Consent.category
//   statusCode/@code                               -> Consent.status
import type { Consent, Reference } from "../../shared/types.js";
import type { CdaNode } from "../parser.js";
import { cdaCodeToCodeableConcept } from "../utils/coding.js";
import { attr, compact } from "../utils/xml-tree.js";
import { mapSection, type SectionMapResult } from "./shared.js";

const ADVANCE_DIRECTIVE_OBSERVATION = "2.16.840.1.113883.10.20.22.4.48";

const STATUS_MAP: Record<string, Consent["status"]> = {
  completed: "active",
  active: "active",
  aborted: "inactive",
  cancelled: "rejected",
};

export function mapAdvanceDirectivesSection(
  root: CdaNode,
  patientRef: Reference,
): SectionMapResult {
  return mapSection(root, patientRef, {
    loincSection: "42348-3",
    sectionName: "Advance Directives",
    templateRoot: ADVANCE_DIRECTIVE_OBSERVATION,
    idPrefix: "consent",
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[AdvanceDirectives]/entry/organizer/component/observation",
    fhirResourceType: "Consent",
    build: (obs, id, patient) => {
      const category = cdaCodeToCodeableConcept(obs["code"] as CdaNode | undefined);
      if (!category) return undefined;

      const statusCode = attr(obs["statusCode"] as CdaNode | undefined, "code");

      return compact({
        resourceType: "Consent",
        id,
        status: (statusCode && STATUS_MAP[statusCode]) ?? "active",
        subject: patient,
        category: [category],
      }) as Consent;
    },
  });
}
