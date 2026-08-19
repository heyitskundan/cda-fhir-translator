import { useMemo } from "react";
import type { Direction } from "../types.js";

interface Props {
  value: string;
  direction: Direction;
  onSwitchDirection: (direction: Direction) => void;
}

/** Shape-only detection: `<` → C-CDA XML, `{` → FHIR JSON. This package doesn't have an
 * `inspectInput`-style detector that identifies the specific document/resource type the
 * way hl7-fhir-translator's does — just the direction, from the first non-whitespace
 * character. */
function detect(value: string): Direction | undefined {
  const trimmed = value.trimStart();
  if (trimmed.startsWith("<")) return "cdaToFhir";
  if (trimmed.startsWith("{")) return "fhirToCda";
  return undefined;
}

export function DetectionBadge({ value, direction, onSwitchDirection }: Props) {
  const detected = useMemo(() => (value.trim() === "" ? undefined : detect(value)), [value]);

  if (!detected) {
    return value.trim() === "" ? null : (
      <span className="tag tag-neutral">
        Doesn&apos;t look like C-CDA XML or a FHIR JSON Bundle
      </span>
    );
  }

  const mismatch = detected !== direction;
  const label = detected === "cdaToFhir" ? "Detected: C-CDA XML" : "Detected: FHIR JSON";

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="tag tag-accent">{label}</span>
      {mismatch && (
        <button
          type="button"
          onClick={() => onSwitchDirection(detected)}
          className="btn"
          style={{ padding: "2px 8px", fontSize: 12 }}
        >
          Switch direction to match →
        </button>
      )}
    </div>
  );
}
