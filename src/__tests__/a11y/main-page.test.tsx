import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import Home from "@/app/page";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock Next.js redirect
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

describe("Main Page Accessibility", () => {
  it("should not have any accessibility violations", async () => {
    const { container } = render(<Home />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should have proper document structure", () => {
    const { container } = render(<Home />);
    
    // Verify the component renders without throwing
    expect(container).toBeInTheDocument();
  });
});
