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

// A second, larger synthetic C-CDA exercising every one of the 26 structured sections
// this package maps, plus two narrative-only sections — so the live demo actually
// demonstrates the full v1.0 section coverage, not just the original three.
export const COMPREHENSIVE_CDA = `<!-- SYNTHETIC DATA ONLY — NOT REAL PHI -->
<ClinicalDocument xmlns="urn:hl7-org:v3">
  <code code="34133-9" codeSystem="2.16.840.1.113883.6.1" displayName="Summarization of episode note"/>
  <effectiveTime value="20240115090000-0500"/>
  <confidentialityCode code="N"/>
  <recordTarget>
    <patientRole>
      <id root="2.16.840.1.113883.19.5" extension="MRN-99000456"/>
      <patient>
        <name><given>Morgan</given><family>Fullcoverage</family></name>
        <administrativeGenderCode code="M" codeSystem="2.16.840.1.113883.5.1"/>
        <birthTime value="19720312"/>
      </patient>
    </patientRole>
  </recordTarget>
  <author>
    <assignedAuthor>
      <id root="2.16.840.1.113883.19.5.9999.456"/>
      <assignedPerson><name><given>Alex</given><family>Provider</family></name></assignedPerson>
    </assignedAuthor>
  </author>
  <custodian>
    <assignedCustodian>
      <representedCustodianOrganization><name>Synthetic Regional Health</name></representedCustodianOrganization>
    </assignedCustodian>
  </custodian>
  <componentOf>
    <encompassingEncounter>
      <effectiveTime><low value="20240114080000-0500"/><high value="20240115090000-0500"/></effectiveTime>
    </encompassingEncounter>
  </componentOf>
  <component>
    <structuredBody>

      <component><section>
        <code code="10154-3" codeSystem="2.16.840.1.113883.6.1" displayName="Chief Complaint"/>
        <title>Chief Complaint</title>
        <text>Follow-up for hypertension and diabetes management.</text>
      </section></component>

      <component><section>
        <code code="10164-2" codeSystem="2.16.840.1.113883.6.1" displayName="History of Present Illness"/>
        <title>History of Present Illness</title>
        <text>Patient reports good adherence to medication regimen, mild fatigue in the afternoons.</text>
      </section></component>

      <component><section>
        <code code="48765-2" codeSystem="2.16.840.1.113883.6.1" displayName="Allergies"/>
        <entry><act classCode="ACT" moodCode="EVN">
          <templateId root="2.16.840.1.113883.10.20.22.4.30"/>
          <statusCode code="active"/>
          <effectiveTime><low value="20180301"/></effectiveTime>
          <entryRelationship typeCode="SUBJ"><observation classCode="OBS" moodCode="EVN">
            <participant typeCode="CSM"><participantRole classCode="MANU"><playingEntity classCode="MMAT">
              <code code="7980" codeSystem="2.16.840.1.113883.6.88" displayName="Penicillin"/>
            </playingEntity></participantRole></participant>
          </observation></entryRelationship>
        </act></entry>
      </section></component>

      <component><section>
        <code code="10160-0" codeSystem="2.16.840.1.113883.6.1" displayName="Medications"/>
        <entry><substanceAdministration classCode="SBADM" moodCode="EVN">
          <templateId root="2.16.840.1.113883.10.20.22.4.16"/>
          <statusCode code="active"/>
          <doseQuantity value="10" unit="mg"/>
          <consumable><manufacturedProduct><manufacturedMaterial>
            <code code="197361" codeSystem="2.16.840.1.113883.6.88" displayName="Lisinopril 10 MG"/>
          </manufacturedMaterial></manufacturedProduct></consumable>
        </substanceAdministration></entry>
      </section></component>

      <component><section>
        <code code="29549-3" codeSystem="2.16.840.1.113883.6.1" displayName="Medications Administered"/>
        <entry><substanceAdministration classCode="SBADM" moodCode="EVN">
          <templateId root="2.16.840.1.113883.10.20.22.4.16"/>
          <statusCode code="completed"/>
          <consumable><manufacturedProduct><manufacturedMaterial>
            <code code="308136" codeSystem="2.16.840.1.113883.6.88" displayName="Morphine 4mg injection"/>
          </manufacturedMaterial></manufacturedProduct></consumable>
        </substanceAdministration></entry>
      </section></component>

      <component><section>
        <code code="42346-7" codeSystem="2.16.840.1.113883.6.1" displayName="Admission Medications"/>
        <entry><substanceAdministration classCode="SBADM" moodCode="EVN">
          <templateId root="2.16.840.1.113883.10.20.22.4.36"/>
          <statusCode code="active"/>
          <consumable><manufacturedProduct><manufacturedMaterial>
            <code code="197517" codeSystem="2.16.840.1.113883.6.88" displayName="Metformin 500 MG"/>
          </manufacturedMaterial></manufacturedProduct></consumable>
        </substanceAdministration></entry>
      </section></component>

      <component><section>
        <code code="75311-1" codeSystem="2.16.840.1.113883.6.1" displayName="Discharge Medications"/>
        <entry><substanceAdministration classCode="SBADM" moodCode="EVN">
          <templateId root="2.16.840.1.113883.10.20.22.4.35"/>
          <statusCode code="active"/>
          <consumable><manufacturedProduct><manufacturedMaterial>
            <code code="1049221" codeSystem="2.16.840.1.113883.6.88" displayName="Atorvastatin 20 MG"/>
          </manufacturedMaterial></manufacturedProduct></consumable>
        </substanceAdministration></entry>
      </section></component>

      <component><section>
        <code code="11450-4" codeSystem="2.16.840.1.113883.6.1" displayName="Problems"/>
        <entry><act><entryRelationship typeCode="SUBJ"><observation>
          <templateId root="2.16.840.1.113883.10.20.22.4.4"/>
          <effectiveTime><low value="20220115"/></effectiveTime>
          <value xsi:type="CD" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" code="44054006" codeSystem="2.16.840.1.113883.6.96" displayName="Type 2 diabetes mellitus"/>
        </observation></entryRelationship></act></entry>
      </section></component>

      <component><section>
        <code code="11348-0" codeSystem="2.16.840.1.113883.6.1" displayName="Past Medical History"/>
        <entry><act><entryRelationship typeCode="SUBJ"><observation>
          <templateId root="2.16.840.1.113883.10.20.22.4.4"/>
          <effectiveTime><low value="20050601"/></effectiveTime>
          <value xsi:type="CD" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" code="195967001" codeSystem="2.16.840.1.113883.6.96" displayName="Asthma"/>
        </observation></entryRelationship></act></entry>
      </section></component>

      <component><section>
        <code code="75310-3" codeSystem="2.16.840.1.113883.6.1" displayName="Health Concerns"/>
        <entry><act classCode="ACT" moodCode="EVN">
          <templateId root="2.16.840.1.113883.10.20.22.4.132"/>
          <code code="88805009" codeSystem="2.16.840.1.113883.6.96" displayName="Chronic pain"/>
          <effectiveTime><low value="20190601"/></effectiveTime>
        </act></entry>
      </section></component>

      <component><section>
        <code code="8716-3" codeSystem="2.16.840.1.113883.6.1" displayName="Vital Signs"/>
        <entry><organizer classCode="CLUSTER" moodCode="EVN">
          <templateId root="2.16.840.1.113883.10.20.22.4.1"/>
          <code code="46680005" codeSystem="2.16.840.1.113883.6.96"/>
          <statusCode code="completed"/>
          <effectiveTime value="20240115083000-0500"/>
          <component><observation classCode="OBS" moodCode="EVN">
            <code code="8480-6" codeSystem="2.16.840.1.113883.6.1" displayName="Systolic blood pressure"/>
            <statusCode code="completed"/>
            <effectiveTime value="20240115083000-0500"/>
            <value xsi:type="PQ" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" value="128" unit="mm[Hg]"/>
          </observation></component>
        </organizer></entry>
      </section></component>

      <component><section>
        <code code="30954-2" codeSystem="2.16.840.1.113883.6.1" displayName="Results"/>
        <entry><organizer classCode="BATTERY" moodCode="EVN">
          <templateId root="2.16.840.1.113883.10.20.22.4.1"/>
          <code code="24323-8" codeSystem="2.16.840.1.113883.6.1" displayName="Comprehensive metabolic panel"/>
          <statusCode code="completed"/>
          <component><observation classCode="OBS" moodCode="EVN">
            <code code="2345-7" codeSystem="2.16.840.1.113883.6.1" displayName="Glucose"/>
            <statusCode code="completed"/>
            <value xsi:type="PQ" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" value="104" unit="mg/dL"/>
          </observation></component>
        </organizer></entry>
      </section></component>

      <component><section>
        <code code="47519-4" codeSystem="2.16.840.1.113883.6.1" displayName="Procedures"/>
        <entry><procedure classCode="PROC" moodCode="EVN">
          <templateId root="2.16.840.1.113883.10.20.22.4.14"/>
          <code code="80146002" codeSystem="2.16.840.1.113883.6.96" displayName="Appendectomy"/>
          <statusCode code="completed"/>
          <effectiveTime value="20150612"/>
        </procedure></entry>
      </section></component>

      <component><section>
        <code code="59772-4" codeSystem="2.16.840.1.113883.6.1" displayName="Planned Procedure"/>
        <entry><procedure classCode="PROC" moodCode="INT">
          <templateId root="2.16.840.1.113883.10.20.22.4.41"/>
          <code code="73761001" codeSystem="2.16.840.1.113883.6.96" displayName="Colonoscopy"/>
          <statusCode code="active"/>
          <effectiveTime value="20240601"/>
        </procedure></entry>
      </section></component>

      <component><section>
        <code code="18776-5" codeSystem="2.16.840.1.113883.6.1" displayName="Plan of Treatment"/>
        <entry><observation classCode="OBS" moodCode="INT">
          <templateId root="2.16.840.1.113883.10.20.22.4.44"/>
          <code code="24606-6" codeSystem="2.16.840.1.113883.6.1" displayName="Chest X-ray"/>
          <statusCode code="active"/>
        </observation></entry>
      </section></component>

      <component><section>
        <code code="11369-6" codeSystem="2.16.840.1.113883.6.1" displayName="Immunizations"/>
        <entry><substanceAdministration classCode="SBADM" moodCode="EVN">
          <templateId root="2.16.840.1.113883.10.20.22.4.52"/>
          <statusCode code="completed"/>
          <effectiveTime value="20231001"/>
          <consumable><manufacturedProduct><manufacturedMaterial>
            <code code="140" codeSystem="2.16.840.1.113883.12.292" displayName="Influenza vaccine"/>
          </manufacturedMaterial></manufacturedProduct></consumable>
        </substanceAdministration></entry>
      </section></component>

      <component><section>
        <code code="46240-8" codeSystem="2.16.840.1.113883.6.1" displayName="Encounters"/>
        <entry><encounter classCode="ENC" moodCode="EVN">
          <templateId root="2.16.840.1.113883.10.20.22.4.49"/>
          <code code="99213" codeSystem="2.16.840.1.113883.6.12" displayName="Office visit"/>
          <statusCode code="completed"/>
          <effectiveTime value="20231115"/>
        </encounter></entry>
      </section></component>

      <component><section>
        <code code="29762-2" codeSystem="2.16.840.1.113883.6.1" displayName="Social History"/>
        <entry><observation classCode="OBS" moodCode="EVN">
          <templateId root="2.16.840.1.113883.10.20.22.4.78"/>
          <code code="72166-2" codeSystem="2.16.840.1.113883.6.1" displayName="Tobacco smoking status"/>
          <statusCode code="completed"/>
          <effectiveTime value="20240115"/>
          <value xsi:type="CD" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" code="8517006" codeSystem="2.16.840.1.113883.6.96" displayName="Former smoker"/>
        </observation></entry>
      </section></component>

      <component><section>
        <code code="10157-6" codeSystem="2.16.840.1.113883.6.1" displayName="Family History"/>
        <entry><organizer classCode="CLUSTER" moodCode="EVN">
          <templateId root="2.16.840.1.113883.10.20.22.4.45"/>
          <statusCode code="completed"/>
          <subject><relatedSubject classCode="PRS">
            <code code="FTH" codeSystem="2.16.840.1.113883.5.111" displayName="Father"/>
          </relatedSubject></subject>
          <component><observation classCode="OBS" moodCode="EVN">
            <templateId root="2.16.840.1.113883.10.20.22.4.46"/>
            <value xsi:type="CD" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" code="38341003" codeSystem="2.16.840.1.113883.6.96" displayName="Hypertension"/>
          </observation></component>
        </organizer></entry>
      </section></component>

      <component><section>
        <code code="48768-6" codeSystem="2.16.840.1.113883.6.1" displayName="Payers"/>
        <entry><act classCode="ACT" moodCode="EVN">
          <templateId root="2.16.840.1.113883.10.20.22.4.60"/>
          <statusCode code="completed"/>
          <entryRelationship typeCode="COMP"><act classCode="ACT" moodCode="EVN">
            <templateId root="2.16.840.1.113883.10.20.22.4.61"/>
            <code code="HMO" codeSystem="2.16.840.1.113883.3.221.5" displayName="Health Maintenance Organization"/>
            <performer typeCode="PRF"><assignedEntity>
              <representedOrganization><name>Synthetic Health Plan</name></representedOrganization>
            </assignedEntity></performer>
          </act></entryRelationship>
        </act></entry>
      </section></component>

      <component><section>
        <code code="42348-3" codeSystem="2.16.840.1.113883.6.1" displayName="Advance Directives"/>
        <entry><organizer><component><observation>
          <templateId root="2.16.840.1.113883.10.20.22.4.48"/>
          <code code="304251008" codeSystem="2.16.840.1.113883.6.96" displayName="Do not resuscitate"/>
          <statusCode code="completed"/>
        </observation></component></organizer></entry>
      </section></component>

      <component><section>
        <code code="47420-5" codeSystem="2.16.840.1.113883.6.1" displayName="Functional Status"/>
        <entry><observation classCode="OBS" moodCode="EVN">
          <templateId root="2.16.840.1.113883.10.20.22.4.67"/>
          <code code="G0100" codeSystem="2.16.840.1.113883.6.1" displayName="Ambulation"/>
          <statusCode code="completed"/>
        </observation></entry>
      </section></component>

      <component><section>
        <code code="10190-7" codeSystem="2.16.840.1.113883.6.1" displayName="Mental Status"/>
        <entry><observation classCode="OBS" moodCode="EVN">
          <templateId root="2.16.840.1.113883.10.20.22.4.74"/>
          <code code="454641000124102" codeSystem="2.16.840.1.113883.6.96" displayName="Oriented x3"/>
          <statusCode code="completed"/>
        </observation></entry>
      </section></component>

      <component><section>
        <code code="11383-7" codeSystem="2.16.840.1.113883.6.1" displayName="Health Status Evaluations and Outcomes"/>
        <entry><observation classCode="OBS" moodCode="EVN">
          <templateId root="2.16.840.1.113883.10.20.22.4.144"/>
          <code code="outcome-1" codeSystem="2.16.840.1.113883.6.1" displayName="A1c trending toward goal"/>
          <statusCode code="completed"/>
        </observation></entry>
      </section></component>

      <component><section>
        <code code="61146-7" codeSystem="2.16.840.1.113883.6.1" displayName="Goals"/>
        <entry><observation classCode="OBS" moodCode="GOL">
          <templateId root="2.16.840.1.113883.10.20.22.4.121"/>
          <code code="target-a1c" codeSystem="2.16.840.1.113883.6.1" displayName="A1c below 7%"/>
          <statusCode code="active"/>
        </observation></entry>
      </section></component>

      <component><section>
        <code code="85847-2" codeSystem="2.16.840.1.113883.6.1" displayName="Care Teams"/>
        <entry><organizer classCode="CLUSTER" moodCode="EVN">
          <templateId root="2.16.840.1.113883.10.20.22.4.500"/>
          <code code="diabetes-care" codeSystem="2.16.840.1.113883.6.1" displayName="Diabetes Care Team"/>
          <statusCode code="active"/>
        </organizer></entry>
      </section></component>

      <component><section>
        <code code="46264-8" codeSystem="2.16.840.1.113883.6.1" displayName="Medical Equipment"/>
        <entry><supply classCode="SPLY" moodCode="EVN">
          <templateId root="2.16.840.1.113883.10.20.22.4.50"/>
          <statusCode code="completed"/>
          <participant typeCode="PRD"><participantRole><playingDevice>
            <code code="58938008" codeSystem="2.16.840.1.113883.6.96" displayName="Wheelchair"/>
          </playingDevice></participantRole></participant>
        </supply></entry>
      </section></component>

      <component><section>
        <title>Nurse Note</title>
        <code code="11488-4" codeSystem="2.16.840.1.113883.11.20.9.68" displayName="Consult note"/>
        <templateId root="2.16.840.1.113883.10.20.22.2.65"/>
        <entry><act classCode="ACT" moodCode="EVN">
          <templateId root="2.16.840.1.113883.10.20.22.4.202"/>
          <code code="11488-4" codeSystem="2.16.840.1.113883.6.1" displayName="Consult note"/>
          <statusCode code="completed"/>
          <text>Patient stable, continue current regimen.</text>
        </act></entry>
      </section></component>

    </structuredBody>
  </component>
</ClinicalDocument>
`;

export interface Sample {
  label: string;
  direction: Direction;
  content: string;
}

// Generated from the C-CDA constants above at module load, rather than hand-duplicated,
// so they can never drift out of sync with what cdaToFhir actually produces.
const sampleBundle = JSON.stringify(cdaToFhir(SAMPLE_CDA).bundle, null, 2);
const comprehensiveBundle = JSON.stringify(cdaToFhir(COMPREHENSIVE_CDA).bundle, null, 2);

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
  {
    label: "Comprehensive CCD (all 26 structured sections + narrative)",
    direction: "cdaToFhir",
    content: COMPREHENSIVE_CDA,
  },
  {
    label: "FHIR Bundle (roundtrip of the comprehensive CCD above)",
    direction: "fhirToCda",
    content: comprehensiveBundle,
  },
];
