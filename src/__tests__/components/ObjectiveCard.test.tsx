import { describe, it, expect } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import ObjectiveCard from "@/components/objectives/ObjectiveCard";
import type { Objective } from "@/types";

// Mock framer-motion (used by ProgressBar inside ObjectiveCard)
jest.mock("framer-motion", () => ({
  motion: {
    div: (props: React.HTMLAttributes<HTMLDivElement>) => <div {...props} />,
  },
}));

const mockObjective: Objective = {
  id: "obj-1",
  title: "Increase revenue by 20%",
  description: "Q1 target",
  level: "company",
  ownerId: "user-1",
  teamId: null,
  periodId: "period-1",
  parentObjectiveId: null,
  status: "active",
  progress: 65,
  confidence: "on_track",
  sortOrder: 0,
  createdAt: "2026-01-01",
  updatedAt: "2026-01-15",
};

describe("ObjectiveCard", () => {
  it("renders objective title", () => {
    render(<ObjectiveCard objective={mockObjective} />);
    expect(screen.getByText("Increase revenue by 20%")).toBeInTheDocument();
  });

  it("renders level badge with French label", () => {
    render(<ObjectiveCard objective={mockObjective} />);
    expect(screen.getByText("Entreprise")).toBeInTheDocument();
  });

  it("renders confidence badge", () => {
    render(<ObjectiveCard objective={mockObjective} />);
    expect(screen.getByText("En bonne voie")).toBeInTheDocument();
  });

  it("renders team level badge", () => {
    render(
      <ObjectiveCard
        objective={{ ...mockObjective, level: "team" }}
      />
    );
    expect(screen.getByText("Equipe")).toBeInTheDocument();
  });

  it("renders individual level badge", () => {
    render(
      <ObjectiveCard
        objective={{ ...mockObjective, level: "individual" }}
      />
    );
    expect(screen.getByText("Individuel")).toBeInTheDocument();
  });

  it("renders progress label", () => {
    render(<ObjectiveCard objective={mockObjective} />);
    expect(screen.getByText("65%")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = jest.fn();
    render(<ObjectiveCard objective={mockObjective} onClick={onClick} />);
    screen.getByText("Increase revenue by 20%").closest("[role='button']")?.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("has button role when onClick is provided", () => {
    const onClick = jest.fn();
    render(<ObjectiveCard objective={mockObjective} onClick={onClick} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("does not have button role when onClick is not provided", () => {
    render(<ObjectiveCard objective={mockObjective} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders key results count when keyResults present", () => {
    const withKRs: Objective = {
      ...mockObjective,
      keyResults: [
        {
          id: "kr-1",
          objectiveId: "obj-1",
          title: "KR1",
          description: "",
          metricType: "number",
          startValue: 0,
          currentValue: 50,
          targetValue: 100,
          unit: "",
          progress: 50,
          confidence: "on_track",
          ownerId: "user-1",
          sortOrder: 0,
          createdAt: "2026-01-01",
          updatedAt: "2026-01-15",
        },
      ],
    };
    render(<ObjectiveCard objective={withKRs} />);
    expect(screen.getByText(/1 resultat cle/)).toBeInTheDocument();
  });
});
