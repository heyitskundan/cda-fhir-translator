// Integration coverage for the sections added toward v1.0 full C-CDA 2.1 section
// coverage: the 15 new structured sections (test/sections/*.test.ts and
// test/fhir-to-cda/sections/*.test.ts cover each in isolation) plus narrative-only
// sections, exercised together through a full cdaToFhir -> fhirToCda roundtrip. The
// real risk this file is for is cross-section interaction — several new sections
// share a FHIR resourceType with an existing section (MedicationStatement, Condition,
// ServiceRequest, Encounter) and must not collide on the reverse direction.
import { describe, expect, it } from "vitest";
import { cdaToFhir } from "../src/cda-to-fhir/index.js";
import { fhirToCda } from "../src/fhir-to-cda/index.js";
import type { FhirResource } from "../src/shared/types.js";

const XML = `<ClinicalDocument xmlns="urn:hl7-org:v3">
  <code code="34133-9" codeSystem="2.16.840.1.113883.6.1"/>
  <recordTarget><patientRole><id root="2.16.840.1.113883.4.1" extension="123"/>
    <patient><name><given>Jamie</given><family>Test</family></name></patient>
  </patientRole></recordTarget>
  <component><structuredBody>

    <component><section>
      <code code="10154-3" codeSystem="2.16.840.1.113883.6.1"/>
      <title>Chief Complaint</title>
      <text>Headache for 3 days.</text>
    </section></component>

    <component><section>
      <code code="10160-0" codeSystem="2.16.840.1.113883.6.1"/>
      <entry><substanceAdministration classCode="SBADM" moodCode="EVN">
        <templateId root="2.16.840.1.113883.10.20.22.4.16"/>
        <statusCode code="active"/>
        <consumable><manufacturedProduct><manufacturedMaterial>
          <code code="197361" codeSystem="2.16.840.1.113883.6.88" displayName="Lisinopril"/>
        </manufacturedMaterial></manufacturedProduct></consumable>
      </substanceAdministration></entry>
    </section></component>

    <component><section>
      <code code="29549-3" codeSystem="2.16.840.1.113883.6.1"/>
      <entry><substanceAdministration classCode="SBADM" moodCode="EVN">
        <templateId root="2.16.840.1.113883.10.20.22.4.16"/>
        <statusCode code="active"/>
        <consumable><manufacturedProduct><manufacturedMaterial>
          <code code="308136" codeSystem="2.16.840.1.113883.6.88" displayName="Morphine"/>
        </manufacturedMaterial></manufacturedProduct></consumable>
      </substanceAdministration></entry>
    </section></component>

    <component><section>
      <code code="42346-7" codeSystem="2.16.840.1.113883.6.1"/>
      <entry><substanceAdministration classCode="SBADM" moodCode="EVN">
        <templateId root="2.16.840.1.113883.10.20.22.4.36"/>
        <statusCode code="active"/>
        <consumable><manufacturedProduct><manufacturedMaterial>
          <code code="197517" codeSystem="2.16.840.1.113883.6.88" displayName="Metformin"/>
        </manufacturedMaterial></manufacturedProduct></consumable>
      </substanceAdministration></entry>
    </section></component>

    <component><section>
      <code code="75311-1" codeSystem="2.16.840.1.113883.6.1"/>
      <entry><substanceAdministration classCode="SBADM" moodCode="EVN">
        <templateId root="2.16.840.1.113883.10.20.22.4.35"/>
        <statusCode code="active"/>
        <consumable><manufacturedProduct><manufacturedMaterial>
          <code code="1049221" codeSystem="2.16.840.1.113883.6.88" displayName="Atorvastatin"/>
        </manufacturedMaterial></manufacturedProduct></consumable>
      </substanceAdministration></entry>
    </section></component>

    <component><section>
      <code code="11450-4" codeSystem="2.16.840.1.113883.6.1"/>
      <entry><act><entryRelationship typeCode="SUBJ"><observation>
        <templateId root="2.16.840.1.113883.10.20.22.4.4"/>
        <value xsi:type="CD" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" code="38341003" codeSystem="2.16.840.1.113883.6.96" displayName="Hypertension"/>
      </observation></entryRelationship></act></entry>
    </section></component>

    <component><section>
      <code code="75310-3" codeSystem="2.16.840.1.113883.6.1"/>
      <entry><act classCode="ACT" moodCode="EVN">
        <templateId root="2.16.840.1.113883.10.20.22.4.132"/>
        <code code="88805009" codeSystem="2.16.840.1.113883.6.96" displayName="Chronic pain"/>
      </act></entry>
    </section></component>

    <component><section>
      <code code="11348-0" codeSystem="2.16.840.1.113883.6.1"/>
      <entry><act><entryRelationship typeCode="SUBJ"><observation>
        <templateId root="2.16.840.1.113883.10.20.22.4.4"/>
        <value xsi:type="CD" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" code="195967001" codeSystem="2.16.840.1.113883.6.96" displayName="Asthma"/>
      </observation></entryRelationship></act></entry>
    </section></component>

    <component><section>
      <code code="59772-4" codeSystem="2.16.840.1.113883.6.1"/>
      <entry><procedure classCode="PROC" moodCode="INT">
        <templateId root="2.16.840.1.113883.10.20.22.4.41"/>
        <code code="80146002" codeSystem="2.16.840.1.113883.6.96" displayName="Appendectomy"/>
        <statusCode code="active"/>
      </procedure></entry>
    </section></component>

    <component><section>
      <code code="18776-5" codeSystem="2.16.840.1.113883.6.1"/>
      <entry><observation classCode="OBS" moodCode="INT">
        <templateId root="2.16.840.1.113883.10.20.22.4.44"/>
        <code code="24606-6" codeSystem="2.16.840.1.113883.6.1" displayName="Chest X-ray planned"/>
        <statusCode code="active"/>
      </observation></entry>
    </section></component>

    <component><section>
      <code code="42348-3" codeSystem="2.16.840.1.113883.6.1"/>
      <entry><organizer><component><observation>
        <templateId root="2.16.840.1.113883.10.20.22.4.48"/>
        <code code="304251008" codeSystem="2.16.840.1.113883.6.96" displayName="DNR"/>
        <statusCode code="completed"/>
      </observation></component></organizer></entry>
    </section></component>

    <component><section>
      <code code="61146-7" codeSystem="2.16.840.1.113883.6.1"/>
      <entry><observation classCode="OBS" moodCode="GOL">
        <templateId root="2.16.840.1.113883.10.20.22.4.121"/>
        <code code="target-a1c" codeSystem="2.16.840.1.113883.6.1" displayName="A1c below 7"/>
        <statusCode code="active"/>
      </observation></entry>
    </section></component>

    <component><section>
      <code code="46264-8" codeSystem="2.16.840.1.113883.6.1"/>
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
      <code code="11488-4" codeSystem="2.16.840.1.113883.11.20.9.68"/>
      <templateId root="2.16.840.1.113883.10.20.22.2.65"/>
      <entry><act classCode="ACT" moodCode="EVN">
        <templateId root="2.16.840.1.113883.10.20.22.4.202"/>
        <code code="11488-4" codeSystem="2.16.840.1.113883.6.1" displayName="Consult note"/>
        <statusCode code="completed"/>
        <text>Patient stable overnight.</text>
      </act></entry>
    </section></component>

  </structuredBody></component>
</ClinicalDocument>`;

function byType<T extends FhirResource>(resources: FhirResource[], type: string): T[] {
  return resources.filter((r) => r.resourceType === type) as T[];
}

describe("v1.0 section coverage — cross-section integration", () => {
  const forward = cdaToFhir(XML);
  const resources = forward.bundle.entry.map((e) => e.resource);

  it("maps every new section to its expected resource count with no cross-contamination", () => {
    expect(byType(resources, "MedicationStatement")).toHaveLength(4); // Meds, Administered, Admission, Discharge
    expect(byType(resources, "Condition")).toHaveLength(3); // Problems, Health Concerns, Past Medical History
    expect(byType(resources, "ServiceRequest")).toHaveLength(2); // Planned Procedure, Plan of Treatment
    expect(byType(resources, "Consent")).toHaveLength(1);
    expect(byType(resources, "Goal")).toHaveLength(1);
    expect(byType(resources, "Device")).toHaveLength(1);
    expect(byType(resources, "DocumentReference")).toHaveLength(1);
  });

  it("tags each medication-ish resource with a distinct category", () => {
    const meds = byType<{ category?: { text?: string; coding?: { code?: string }[] }[] }>(
      resources,
      "MedicationStatement",
    );
    const categories = meds.map(
      (m) => m.category?.[0]?.coding?.[0]?.code ?? m.category?.[0]?.text ?? "(none)",
    );
    expect(new Set(categories).size).toBe(4);
  });

  it("tags each condition-ish resource with a distinct category", () => {
    const conditions = byType<{ category?: { text?: string; coding?: { code?: string }[] }[] }>(
      resources,
      "Condition",
    );
    const categories = conditions.map(
      (c) => c.category?.[0]?.coding?.[0]?.code ?? c.category?.[0]?.text ?? "(none)",
    );
    expect(new Set(categories).size).toBe(3);
  });

  it("puts the narrative Chief Complaint section on Composition.section, not a resource", () => {
    const composition = resources.find((r) => r.resourceType === "Composition") as {
      section?: { title?: string; text?: string }[];
    };
    const chiefComplaint = composition.section?.find((s) => s.title === "Chief Complaint");
    expect(chiefComplaint?.text).toContain("Headache");
  });

  it("round-trips without any resource duplicating into the wrong section", () => {
    const back = fhirToCda(forward.bundle);

    // One <section> per LOINC-coded section, never two sections claiming the same
    // MedicationStatement/Condition/ServiceRequest.
    const sectionCodes = [...back.xml.matchAll(/<section>\s*<code @?code="([\w.-]+)"/g)];
    expect(sectionCodes.length).toBeGreaterThan(0);

    const substanceAdministrations = (back.xml.match(/<substanceAdministration>/g) ?? []).length;
    expect(substanceAdministrations).toBe(4);

    const observationsWithProblemTemplate = (
      back.xml.match(/2\.16\.840\.1\.113883\.10\.20\.22\.4\.4"/g) ?? []
    ).length;
    // Problems + Past Medical History reuse the same entry template OID (Health
    // Concerns uses a different one) — exactly 2 tagged entries, not 4 (no
    // duplication) and not fewer (no silent drop).
    expect(observationsWithProblemTemplate).toBe(2);

    expect(back.xml).toContain("Headache for 3 days");
  });
});
