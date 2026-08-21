// Medical Equipment (46264-8). Reverse of cda-to-fhir/sections/medical-equipment.ts —
// see docs/CCDA_FHIR_MAPPING.md.
import type { Device } from "../../shared/types.js";
import type { CdaNode } from "../../cda-to-fhir/parser.js";
import { compact } from "../../cda-to-fhir/utils/xml-tree.js";
import { codeableConceptToCdaCode } from "../utils/coding.js";
import { buildSection, type SectionBuildResult } from "./shared.js";

const NON_MEDICINAL_SUPPLY_ACTIVITY = "2.16.840.1.113883.10.20.22.4.50";

function buildEntry(device: Device): CdaNode | undefined {
  const code = codeableConceptToCdaCode(device.type);
  if (!code) return undefined;

  return {
    supply: compact({
      templateId: { "@root": NON_MEDICINAL_SUPPLY_ACTIVITY },
      statusCode: device.status ? { "@code": device.status } : undefined,
      participant: {
        "@typeCode": "PRD",
        participantRole: { playingDevice: { code } },
      },
    }),
  } as CdaNode;
}

export function buildMedicalEquipmentSection(devices: Device[]): SectionBuildResult {
  const entries = devices
    .map((d) => {
      const node = buildEntry(d);
      return node ? { node, resourceId: d.id ?? "unknown" } : undefined;
    })
    .filter((e): e is { node: CdaNode; resourceId: string } => e !== undefined);

  return buildSection(entries, {
    loincSection: "46264-8",
    sectionTitle: "Medical Equipment",
    fhirResourceType: "Device",
    cdaPath:
      "ClinicalDocument/component/structuredBody/component/section[MedicalEquipment]/entry/supply",
  });
}
