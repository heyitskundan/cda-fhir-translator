// Payers / Insurance (48768-6). Mapping (see docs/CCDA_FHIR_MAPPING.md):
//   act[templateId=...22.4.60]                                     -> Coverage
//   act/statusCode/@code                                            -> Coverage.status
//   entryRelationship/act[templateId=...22.4.61]/code                -> Coverage.type
//   .../performer/assignedEntity/representedOrganization/name        -> Coverage.payor[].display
import type { Coverage, Reference } from "../../shared/types.js";
import type { CdaNode } from "../parser.js";
import { cdaCodeToCodeableConcept } from "../utils/coding.js";
import { asArray, attr, compact } from "../utils/xml-tree.js";
import { mapSection, type SectionMapResult } from "./shared.js";

const COVERAGE_ACTIVITY = "2.16.840.1.113883.10.20.22.4.60";
const POLICY_ACTIVITY = "2.16.840.1.113883.10.20.22.4.61";

const STATUS_MAP: Record<string, Coverage["status"]> = {
  completed: "active",
  active: "active",
  aborted: "cancelled",
  cancelled: "cancelled",
};

function findPolicyActivity(act: CdaNode): CdaNode | undefined {
  for (const er of asArray(act["entryRelationship"] as CdaNode | CdaNode[] | undefined)) {
    const inner = er["act"] as CdaNode | undefined;
    const templateIds = asArray(inner?.["templateId"] as CdaNode | CdaNode[] | undefined);
    if (templateIds.some((t) => attr(t, "root") === POLICY_ACTIVITY)) return inner;
  }
  return undefined;
}

export function mapPayersSection(root: CdaNode, patientRef: Reference): SectionMapResult {
  return mapSection(root, patientRef, {
    loincSection: "48768-6",
    sectionName: "Payers",
    templateRoot: COVERAGE_ACTIVITY,
    idPrefix: "coverage",
    cdaPath: "ClinicalDocument/component/structuredBody/component/section[Payers]/entry/act",
    fhirResourceType: "Coverage",
    build: (act, id, patient) => {
      const policy = findPolicyActivity(act);
      const type = cdaCodeToCodeableConcept(policy?.["code"] as CdaNode | undefined);

      const orgName = (
        (
          (policy?.["performer"] as CdaNode | undefined)?.["assignedEntity"] as
            CdaNode | undefined
        )?.["representedOrganization"] as CdaNode | undefined
      )?.["name"];
      const payor =
        typeof orgName === "string" ? [{ display: orgName }] : undefined;

      const statusCode = attr(act["statusCode"] as CdaNode | undefined, "code");

      return compact({
        resourceType: "Coverage",
        id,
        status: (statusCode && STATUS_MAP[statusCode]) ?? "active",
        beneficiary: patient,
        type,
        payor,
      }) as Coverage;
    },
  });
}
