import { describe, it, expect } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import ConfidenceBadge from "@/components/ui/ConfidenceBadge";

describe("ConfidenceBadge", () => {
  it("renders on_track badge", () => {
    render(<ConfidenceBadge confidence="on_track" />);
    expect(screen.getByText("En bonne voie")).toBeInTheDocument();
  });

  it("renders at_risk badge", () => {
    render(<ConfidenceBadge confidence="at_risk" />);
    expect(screen.getByText("À risque")).toBeInTheDocument();
  });

  it("renders off_track badge", () => {
    render(<ConfidenceBadge confidence="off_track" />);
    expect(screen.getByText("En retard")).toBeInTheDocument();
  });

  it("renders with sm size", () => {
    const { container } = render(
      <ConfidenceBadge confidence="on_track" size="sm" />
    );
    expect(container.firstChild).toHaveClass("px-2");
  });

  it("renders with md size by default", () => {
    const { container } = render(
      <ConfidenceBadge confidence="on_track" />
    );
    expect(container.firstChild).toHaveClass("px-2.5");
  });
});
