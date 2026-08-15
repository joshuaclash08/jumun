import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";

describe("test foundation", () => {
  it("renders with React Testing Library and queries by accessible role", () => {
    render(<button aria-label="담기">담기</button>);
    expect(screen.getByRole("button", { name: "담기" })).toBeInTheDocument();
  });

  it("runs axe-core accessibility checks via vitest-axe", async () => {
    const { container } = render(
      <button aria-label="담기">담기</button>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
