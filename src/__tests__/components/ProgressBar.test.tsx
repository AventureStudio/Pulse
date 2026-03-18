import { describe, it, expect } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import ProgressBar from "@/components/ui/ProgressBar";

// Mock framer-motion to render a plain div instead of motion.div
jest.mock("framer-motion", () => ({
  motion: {
    div: (props: React.HTMLAttributes<HTMLDivElement>) => <div {...props} />,
  },
}));

describe("ProgressBar", () => {
  it("renders without crashing", () => {
    const { container } = render(<ProgressBar progress={50} />);
    expect(container).toBeTruthy();
  });

  it("shows label when showLabel is true", () => {
    render(<ProgressBar progress={75} showLabel />);
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("does not show label when showLabel is false", () => {
    const { container } = render(<ProgressBar progress={75} />);
    expect(container.textContent).not.toContain("75%");
  });

  it("clamps progress to 0 minimum", () => {
    render(<ProgressBar progress={-10} showLabel />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("clamps progress to 100 maximum", () => {
    render(<ProgressBar progress={150} showLabel />);
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("renders with different sizes", () => {
    const { rerender, container } = render(
      <ProgressBar progress={50} size="sm" />
    );
    expect(container.querySelector("[class*='h-']")).toBeTruthy();

    rerender(<ProgressBar progress={50} size="lg" />);
    expect(container.querySelector("[class*='h-']")).toBeTruthy();
  });
});
