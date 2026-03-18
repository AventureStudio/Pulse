import { describe, it, expect } from "@jest/globals";
import { confidenceConfig } from "@/lib/utils/confidence";

describe("confidenceConfig", () => {
  it("has all three confidence levels", () => {
    expect(confidenceConfig).toHaveProperty("on_track");
    expect(confidenceConfig).toHaveProperty("at_risk");
    expect(confidenceConfig).toHaveProperty("off_track");
  });
  it("each level has required properties", () => {
    for (const key of ["on_track", "at_risk", "off_track"] as const) {
      const config = confidenceConfig[key];
      expect(config).toHaveProperty("label");
      expect(config).toHaveProperty("color");
      expect(config).toHaveProperty("bgColor");
      expect(config).toHaveProperty("dotColor");
      expect(typeof config.label).toBe("string");
      expect(config.label.length).toBeGreaterThan(0);
    }
  });
});
