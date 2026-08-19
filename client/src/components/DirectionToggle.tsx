import type { Direction } from "../types.js";

interface Props {
  direction: Direction;
  onChange: (direction: Direction) => void;
}

export function DirectionToggle({ direction, onChange }: Props) {
  return (
    <div className="seg" role="radiogroup" aria-label="Translation direction">
      {(
        [
          { value: "cdaToFhir", label: "C-CDA → FHIR" },
          { value: "fhirToCda", label: "FHIR → C-CDA" },
        ] as const
      ).map((opt) => (
        <label key={opt.value} className="seg-opt">
          <input
            type="radio"
            name="direction"
            checked={direction === opt.value}
            onChange={() => onChange(opt.value)}
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}
