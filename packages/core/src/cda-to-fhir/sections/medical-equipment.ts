// Medical Equipment (46264-8). Mapping (see docs/CCDA_FHIR_MAPPING.md):
//   entry/.../supply[templateId=...22.4.50] (Non-Medicinal Supply Activity) -> Device
//   participant/participantRole/playingDevice/code                          -> Device.type
//   statusCode/@code                                                        -> Device.status
import type { Device, Reference } from "../../shared/types.js";
import type { CdaNode } from "../parser.js";
import { cdaCodeToCodeableConcept } from "../utils/coding.js";
import { attr, compact } from "../utils/xml-tree.js";
import { mapSection, type SectionMapResult } from "./shared.js";

const NON_MEDICINAL_SUPPLY_ACTIVITY = "2.16.840.1.113883.10.20.22.4.50";

export function mapMedicalEquipmentSection(
  root: CdaNode,
  patientRef: Reference,
): SectionMapResult {
  return mapSection(root, patientRef, {
    loincSection: "46264-8",
    sectionName: "Medical Equipment",
    templateRoot: NON_MEDICINAL_SUPPLY_ACTIVITY,
    idPrefix: "device",
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[MedicalEquipment]/entry/supply",
    fhirResourceType: "Device",
    build: (supply, id, patient) => {
      const playingDevice = (
        (
          (supply["participant"] as CdaNode | undefined)?.["participantRole"] as
            CdaNode | undefined
        )?.["playingDevice"] as CdaNode | undefined
      )?.["code"] as CdaNode | undefined;
      const type = cdaCodeToCodeableConcept(playingDevice);
      if (!type) return undefined;

      const status = attr(supply["statusCode"] as CdaNode | undefined, "code");

      return compact({
        resourceType: "Device",
        id,
        status,
        type,
        patient,
      }) as Device;
    },
  });
}
