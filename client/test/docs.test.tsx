import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Docs } from "../src/components/docs/Docs.js";

describe("Docs", () => {
  it("defaults to Getting Started", () => {
    render(<Docs />);
    expect(screen.getByRole("heading", { name: "Getting Started", level: 1 })).toBeDefined();
  });

  it("navigates to every page via the sidebar", () => {
    render(<Docs />);
    fireEvent.click(screen.getByText("API Reference"));
    expect(screen.getByRole("heading", { name: "API Reference", level: 1 })).toBeDefined();

    fireEvent.click(screen.getByText("Data Mapping & Schemas"));
    expect(screen.getByRole("heading", { name: "Data Mapping & Schemas", level: 1 })).toBeDefined();

    fireEvent.click(screen.getByText("Changelog"));
    expect(screen.getByRole("heading", { name: "Changelog", level: 1 })).toBeDefined();
  });
});
