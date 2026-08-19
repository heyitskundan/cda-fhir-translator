import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "../src/App.js";

describe("App", () => {
  it("renders the nav brand and defaults to the Translator view", () => {
    render(<App />);
    expect(screen.getByText("cda-fhir-translator")).toBeDefined();
    expect(screen.getByLabelText(/Translation direction/i)).toBeDefined();
  });

  it("switches to the Docs view and back via the nav toggle", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("radio", { name: "Docs" }));
    expect(screen.getByRole("heading", { name: "Getting Started", level: 1 })).toBeDefined();

    fireEvent.click(screen.getByRole("radio", { name: "Translator" }));
    expect(screen.getByLabelText(/Translation direction/i)).toBeDefined();
  });
});
