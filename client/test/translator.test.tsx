import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Translator } from "../src/components/Translator.js";
import { SAMPLES } from "../src/samples.js";

describe("Translator (integration — real cdaToFhir/fhirToCda logic, not mocked)", () => {
  it("translates the sample CCD to a FHIR Bundle when Translate is clicked", async () => {
    const { fireEvent } = await import("@testing-library/react");
    render(<Translator />);

    const textarea = screen.getByRole("textbox");
    const ccdSample = SAMPLES.find((s) => s.direction === "cdaToFhir");
    if (!ccdSample) throw new Error("expected a cdaToFhir sample");
    fireEvent.change(textarea, { target: { value: ccdSample.content } });
    fireEvent.click(screen.getByRole("button", { name: "Translate" }));

    expect(screen.getAllByText(/"resourceType"/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/"Bundle"/).length).toBeGreaterThan(0);
  });

  it("shows a readable error for invalid FHIR JSON in the fhirToCda direction", async () => {
    const { fireEvent } = await import("@testing-library/react");
    render(<Translator />);

    fireEvent.click(screen.getByRole("radio", { name: "FHIR → C-CDA" }));
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "not json" } });
    fireEvent.click(screen.getByRole("button", { name: "Translate" }));

    expect(screen.getByText("Translation failed")).toBeDefined();
    expect(screen.getByText(/not valid JSON/)).toBeDefined();
  });
});
