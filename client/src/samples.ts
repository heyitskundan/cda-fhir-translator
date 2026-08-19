import { cdaToFhir } from "cda-fhir-translator";
import type { Direction } from "./types.js";

// Synthetic C-CDA snippet — not real patient data.
export const SAMPLE_CDA = `<!-- SYNTHETIC DATA ONLY — NOT REAL PHI -->
<ClinicalDocument xmlns="urn:hl7-org:v3">
  <code code="34133-9" codeSystem="2.16.840.1.113883.6.1" displayName="Summarization of episode note"/>
  <effectiveTime value="20240110090000-0500"/>
  <confidentialityCode code="N"/>
  <recordTarget>
    <patientRole>
      <id root="2.16.840.1.113883.19.5" extension="MRN-99000123"/>
      <patient>
        <name><given>Jamie</given><family>Synthfield</family></name>
        <administrativeGenderCode code="F" codeSystem="2.16.840.1.113883.5.1"/>
        <birthTime value="19850604"/>
      </patient>
    </patientRole>
  </recordTarget>
  <component>
    <structuredBody>
      <component>
        <section>
          <code code="48765-2" codeSystem="2.16.840.1.113883.6.1" displayName="Allergies"/>
          <entry>
            <act classCode="ACT" moodCode="EVN">
              <templateId root="2.16.840.1.113883.10.20.22.4.30"/>
              <statusCode code="active"/>
              <effectiveTime><low value="20200301"/></effectiveTime>
              <entryRelationship typeCode="SUBJ">
                <observation classCode="OBS" moodCode="EVN">
                  <participant typeCode="CSM">
                    <participantRole classCode="MANU">
                      <playingEntity classCode="MMAT">
                        <code code="7980" codeSystem="2.16.840.1.113883.6.88" displayName="Penicillin"/>
                      </playingEntity>
                    </participantRole>
                  </participant>
                </observation>
              </entryRelationship>
            </act>
          </entry>
        </section>
      </component>
      <component>
        <section>
          <code code="11450-4" codeSystem="2.16.840.1.113883.6.1" displayName="Problems"/>
          <entry>
            <act classCode="ACT" moodCode="EVN">
              <entryRelationship typeCode="SUBJ">
                <observation classCode="OBS" moodCode="EVN">
                  <templateId root="2.16.840.1.113883.10.20.22.4.4"/>
                  <effectiveTime><low value="20220115"/></effectiveTime>
                  <value xsi:type="CD" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" code="44054006" codeSystem="2.16.840.1.113883.6.96" displayName="Type 2 diabetes mellitus"/>
                </observation>
              </entryRelationship>
            </act>
          </entry>
        </section>
      </component>
      <component>
        <section>
          <code code="10160-0" codeSystem="2.16.840.1.113883.6.1" displayName="Medications"/>
          <entry>
            <substanceAdministration classCode="SBADM" moodCode="EVN">
              <templateId root="2.16.840.1.113883.10.20.22.4.16"/>
              <statusCode code="active"/>
              <doseQuantity value="10" unit="mg"/>
              <consumable>
                <manufacturedProduct>
                  <manufacturedMaterial>
                    <code code="197361" codeSystem="2.16.840.1.113883.6.88" displayName="Lisinopril 10 MG"/>
                  </manufacturedMaterial>
                </manufacturedProduct>
              </consumable>
            </substanceAdministration>
          </entry>
        </section>
      </component>
    </structuredBody>
  </component>
</ClinicalDocument>
`;

export interface Sample {
  label: string;
  direction: Direction;
  content: string;
}

// Generated from SAMPLE_CDA above at module load, rather than hand-duplicated, so it can
// never drift out of sync with what cdaToFhir actually produces for it.
const sampleBundle = JSON.stringify(cdaToFhir(SAMPLE_CDA).bundle, null, 2);

export const SAMPLES: Sample[] = [
  {
    label: "Synthetic CCD (Allergies, Problems, Medications)",
    direction: "cdaToFhir",
    content: SAMPLE_CDA,
  },
  {
    label: "FHIR Bundle (roundtrip of the CCD above)",
    direction: "fhirToCda",
    content: sampleBundle,
  },
];
