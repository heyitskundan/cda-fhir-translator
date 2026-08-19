// FHIR dateTime/date -> HL7 CDA timestamp. Reverse of cda-to-fhir/utils/dates.ts.
//   2023-01-15T14:30:22-05:00 -> 20230115143022-0500
//   2023-01-15                -> 20230115
//   2023-01                   -> 202301
//   2023                      -> 2023
const FULL_DATETIME =
  /^(?<y>\d{4})-(?<mo>\d{2})-(?<d>\d{2})T(?<h>\d{2}):(?<mi>\d{2}):(?<s>\d{2})(?:(?<tzsign>[+-])(?<tzh>\d{2}):(?<tzm>\d{2})|Z)?$/;
const PARTIAL_DATE = /^(?<y>\d{4})(?:-(?<mo>\d{2})(?:-(?<d>\d{2}))?)?$/;

export function fhirDateTimeToHl7Timestamp(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const v = value.trim();

  const full = FULL_DATETIME.exec(v);
  if (full?.groups) {
    const { y, mo, d, h, mi, s, tzsign, tzh, tzm } = full.groups;
    const tz = tzsign && tzh && tzm ? `${tzsign}${tzh}${tzm}` : "";
    return `${y}${mo}${d}${h}${mi}${s}${tz}`;
  }

  const partial = PARTIAL_DATE.exec(v);
  if (partial?.groups) {
    const { y, mo, d } = partial.groups;
    if (y && mo && d) return `${y}${mo}${d}`;
    if (y && mo) return `${y}${mo}`;
    return y;
  }

  return undefined;
}
