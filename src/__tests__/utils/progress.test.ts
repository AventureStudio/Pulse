import { describe, it, expect } from "@jest/globals";
import { calculateProgress, formatProgress, progressColor } from "@/lib/utils/progress";

describe("calculateProgress", () => {
  it("returns 0 when current equals start", () => {
    expect(calculateProgress(0, 0, 100)).toBe(0);
  });
  it("returns 100 when current equals target", () => {
    expect(calculateProgress(100, 0, 100)).toBe(100);
  });
  it("returns 50 for halfway", () => {
    expect(calculateProgress(50, 0, 100)).toBe(50);
  });
  it("clamps at 0 when below start", () => {
    expect(calculateProgress(-10, 0, 100)).toBe(0);
  });
  it("clamps at 100 when above target", () => {
    expect(calculateProgress(150, 0, 100)).toBe(100);
  });
  it("handles non-zero start value", () => {
    expect(calculateProgress(75, 50, 100)).toBe(50);
  });
  it("returns 0 when target equals start (division by zero)", () => {
    expect(calculateProgress(50, 50, 50)).toBe(0);
  });
  it("rounds to nearest integer", () => {
    expect(calculateProgress(33, 0, 100)).toBe(33);
    expect(calculateProgress(1, 0, 3)).toBe(33);
  });
});

describe("formatProgress", () => {
  it("formats as percentage string", () => {
    expect(formatProgress(75)).toBe("75%");
    expect(formatProgress(0)).toBe("0%");
    expect(formatProgress(100)).toBe("100%");
  });
});

describe("progressColor", () => {
  it("returns green for >= 70", () => {
    expect(progressColor(70)).toContain("success");
    expect(progressColor(100)).toContain("success");
  });
  it("returns warning for >= 40 and < 70", () => {
    expect(progressColor(40)).toContain("warning");
    expect(progressColor(69)).toContain("warning");
  });
  it("returns danger for < 40", () => {
    expect(progressColor(0)).toContain("danger");
    expect(progressColor(39)).toContain("danger");
  });
});
