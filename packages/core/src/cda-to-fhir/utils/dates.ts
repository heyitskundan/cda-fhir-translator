// HL7 CDA timestamp -> FHIR dateTime/date. Examples:
//   20230115             -> 2023-01-15
//   202301                -> 2023-01
//   2023                  -> 2023
//   20230115143022-0500   -> 2023-01-15T14:30:22-05:00
const FULL_TIMESTAMP =
  /^(?<y>\d{4})(?<mo>\d{2})(?<d>\d{2})(?<h>\d{2})(?<mi>\d{2})(?<s>\d{2})(?:(?<tzsign>[+-])(?<tzh>\d{2})(?<tzm>\d{2}))?$/;
const PARTIAL_DATE = /^(?<y>\d{4})(?:(?<mo>\d{2})(?:(?<d>\d{2}))?)?$/;

export function hl7TimestampToFhirDateTime(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const v = value.trim();

  const full = FULL_TIMESTAMP.exec(v);
  if (full?.groups) {
    const { y, mo, d, h, mi, s, tzsign, tzh, tzm } = full.groups;
    const tz = tzsign && tzh && tzm ? `${tzsign}${tzh}:${tzm}` : "Z";
    return `${y}-${mo}-${d}T${h}:${mi}:${s}${tz}`;
  }

  return hl7TimestampToFhirDate(v);
}

export function hl7TimestampToFhirDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const partial = PARTIAL_DATE.exec(value.trim());
  if (!partial?.groups) return undefined;
  const { y, mo, d } = partial.groups;
  if (y && mo && d) return `${y}-${mo}-${d}`;
  if (y && mo) return `${y}-${mo}`;
  return y;
}
