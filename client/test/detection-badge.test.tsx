import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DetectionBadge } from "../src/components/DetectionBadge.js";

describe("DetectionBadge", () => {
  it("shows nothing for empty input", () => {
    const { container } = render(
      <DetectionBadge value="" direction="cdaToFhir" onSwitchDirection={() => {}} />,
    );
    expect(container.textContent).toBe("");
  });

  it("detects C-CDA XML and doesn't offer to switch when direction already matches", () => {
    render(
      <DetectionBadge
        value="<ClinicalDocument/>"
        direction="cdaToFhir"
        onSwitchDirection={() => {}}
      />,
    );
    expect(screen.getByText(/Detected: C-CDA XML/)).toBeDefined();
    expect(screen.queryByText(/Switch direction/)).toBeNull();
  });

  it("offers to switch direction on a mismatch", () => {
    render(
      <DetectionBadge
        value='{"resourceType":"Bundle"}'
        direction="cdaToFhir"
        onSwitchDirection={() => {}}
      />,
    );
    expect(screen.getByText(/Detected: FHIR JSON/)).toBeDefined();
    expect(screen.getByText(/Switch direction to match/)).toBeDefined();
  });

  it("shows an unrecognized-format tag for neither shape", () => {
    render(
      <DetectionBadge value="plain text" direction="cdaToFhir" onSwitchDirection={() => {}} />,
    );
    expect(screen.getByText(/Doesn't look like/)).toBeDefined();
  });
});
