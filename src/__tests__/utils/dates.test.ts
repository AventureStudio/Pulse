import { describe, it, expect } from "@jest/globals";
import { formatDate, periodProgress } from "@/lib/utils/dates";

describe("formatDate", () => {
  it("formats a date string in French format", () => {
    const result = formatDate("2026-03-18T10:00:00Z");
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });
});

describe("periodProgress", () => {
  it("returns 0 when now is before start", () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const futureEnd = new Date(future);
    futureEnd.setMonth(futureEnd.getMonth() + 3);
    expect(periodProgress(future.toISOString(), futureEnd.toISOString())).toBe(0);
  });
  it("returns 100 when now is after end", () => {
    const past = new Date();
    past.setFullYear(past.getFullYear() - 2);
    const pastEnd = new Date(past);
    pastEnd.setMonth(pastEnd.getMonth() + 3);
    expect(periodProgress(past.toISOString(), pastEnd.toISOString())).toBe(100);
  });
  it("returns a value between 0 and 100 for current period", () => {
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    const end = new Date();
    end.setMonth(end.getMonth() + 2);
    const result = periodProgress(start.toISOString(), end.toISOString());
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(100);
  });
});
