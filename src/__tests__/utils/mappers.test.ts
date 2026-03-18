import { describe, it, expect } from "@jest/globals";
import { toObjective, toKeyResult, toCheckIn, toTeam, toPeriod, toUser } from "@/lib/utils/mappers";

describe("toObjective", () => {
  it("maps snake_case DB row to camelCase Objective", () => {
    const row = {
      id: "abc-123",
      title: "Increase revenue",
      description: "Q1 goal",
      level: "company",
      owner_id: "user-1",
      team_id: "team-1",
      period_id: "period-1",
      parent_objective_id: null,
      status: "active",
      progress: 45,
      confidence: "on_track",
      sort_order: 0,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-15T00:00:00Z",
    };
    const result = toObjective(row);
    expect(result.id).toBe("abc-123");
    expect(result.ownerId).toBe("user-1");
    expect(result.teamId).toBe("team-1");
    expect(result.periodId).toBe("period-1");
    expect(result.parentObjectiveId).toBeNull();
    expect(result.sortOrder).toBe(0);
    expect(result.createdAt).toBe("2026-01-01T00:00:00Z");
  });
});

describe("toKeyResult", () => {
  it("maps snake_case DB row to camelCase KeyResult", () => {
    const row = {
      id: "kr-1",
      objective_id: "obj-1",
      title: "NPS > 50",
      description: "",
      metric_type: "number",
      start_value: "30",
      current_value: "42",
      target_value: "50",
      unit: "points",
      progress: 60,
      confidence: "at_risk",
      owner_id: "user-1",
      sort_order: 1,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-15T00:00:00Z",
    };
    const result = toKeyResult(row);
    expect(result.objectiveId).toBe("obj-1");
    expect(result.metricType).toBe("number");
    expect(result.startValue).toBe(30);
    expect(result.currentValue).toBe(42);
    expect(result.targetValue).toBe(50);
  });
});

describe("toCheckIn", () => {
  it("maps snake_case DB row to camelCase CheckIn", () => {
    const row = {
      id: "ci-1",
      key_result_id: "kr-1",
      author_id: "user-1",
      previous_value: "30",
      new_value: "42",
      confidence: "on_track",
      note: "Good progress",
      created_at: "2026-01-15T00:00:00Z",
    };
    const result = toCheckIn(row);
    expect(result.keyResultId).toBe("kr-1");
    expect(result.authorId).toBe("user-1");
    expect(result.previousValue).toBe(30);
    expect(result.newValue).toBe(42);
  });
});

describe("toTeam", () => {
  it("maps snake_case DB row to camelCase Team", () => {
    const row = {
      id: "team-1",
      name: "Marketing",
      description: "Marketing dept",
      parent_team_id: null,
      created_at: "2026-01-01T00:00:00Z",
    };
    const result = toTeam(row);
    expect(result.name).toBe("Marketing");
    expect(result.parentTeamId).toBeNull();
  });
});

describe("toPeriod", () => {
  it("maps snake_case DB row to camelCase Period", () => {
    const row = {
      id: "p-1",
      label: "Q1 2026",
      start_date: "2026-01-01",
      end_date: "2026-03-31",
      is_active: true,
      created_at: "2026-01-01T00:00:00Z",
    };
    const result = toPeriod(row);
    expect(result.label).toBe("Q1 2026");
    expect(result.startDate).toBe("2026-01-01");
    expect(result.isActive).toBe(true);
  });
});

describe("toUser", () => {
  it("maps snake_case DB row to camelCase User", () => {
    const row = {
      id: "u-1",
      full_name: "Jean Dupont",
      email: "jean@example.com",
      avatar_url: null,
      role: "admin",
      team_id: "team-1",
      created_at: "2026-01-01T00:00:00Z",
    };
    const result = toUser(row);
    expect(result.fullName).toBe("Jean Dupont");
    expect(result.avatarUrl).toBeNull();
    expect(result.teamId).toBe("team-1");
  });
});
