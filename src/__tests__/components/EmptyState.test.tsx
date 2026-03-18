import { describe, it, expect } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import EmptyState from "@/components/ui/EmptyState";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <EmptyState
        icon={<span data-testid="icon">icon</span>}
        title="No items"
        description="Create your first item"
      />
    );
    expect(screen.getByText("No items")).toBeInTheDocument();
    expect(screen.getByText("Create your first item")).toBeInTheDocument();
  });

  it("renders the icon", () => {
    render(
      <EmptyState
        icon={<span data-testid="icon">icon</span>}
        title="Empty"
        description="Nothing here"
      />
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("renders action link when provided", () => {
    render(
      <EmptyState
        icon={<span>icon</span>}
        title="Empty"
        description="Nothing here"
        action={{ label: "Create", href: "/new" }}
      />
    );
    expect(screen.getByText("Create")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/new");
  });

  it("does not render action when not provided", () => {
    render(
      <EmptyState
        icon={<span>icon</span>}
        title="Empty"
        description="Nothing here"
      />
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
