import { describe, it, expect } from "@jest/globals";
import { translations } from "@/lib/i18n/translations";

describe("translations", () => {
  it("all keys have both fr and en translations", () => {
    const keys = Object.keys(translations) as (keyof typeof translations)[];
    const missing: string[] = [];

    for (const key of keys) {
      const entry = translations[key];
      if (!entry.fr) missing.push(`${key}.fr`);
      if (!entry.en) missing.push(`${key}.en`);
    }

    expect(missing).toEqual([]);
  });

  it("no translation value contains unicode escape sequences", () => {
    const keys = Object.keys(translations) as (keyof typeof translations)[];
    const issues: string[] = [];

    for (const key of keys) {
      const entry = translations[key];
      if (/\\u[0-9a-fA-F]{4}/.test(entry.fr)) issues.push(`${key}.fr`);
      if (/\\u[0-9a-fA-F]{4}/.test(entry.en)) issues.push(`${key}.en`);
    }

    expect(issues).toEqual([]);
  });

  it("no translation value contains HTML entities", () => {
    const keys = Object.keys(translations) as (keyof typeof translations)[];
    const issues: string[] = [];

    for (const key of keys) {
      const entry = translations[key];
      if (/&[a-z]+;/.test(entry.fr)) issues.push(`${key}.fr`);
      if (/&[a-z]+;/.test(entry.en)) issues.push(`${key}.en`);
    }

    expect(issues).toEqual([]);
  });

  it("has required key sections", () => {
    const keys = Object.keys(translations);
    expect(keys.some(k => k.startsWith("common."))).toBe(true);
    expect(keys.some(k => k.startsWith("auth."))).toBe(true);
    expect(keys.some(k => k.startsWith("nav."))).toBe(true);
    expect(keys.some(k => k.startsWith("dashboard."))).toBe(true);
    expect(keys.some(k => k.startsWith("objectives."))).toBe(true);
    expect(keys.some(k => k.startsWith("kr."))).toBe(true);
    expect(keys.some(k => k.startsWith("teams."))).toBe(true);
    expect(keys.some(k => k.startsWith("periods."))).toBe(true);
    expect(keys.some(k => k.startsWith("form."))).toBe(true);
  });

  it("French translations contain proper accented characters", () => {
    expect(translations["dashboard.atRisk"].fr).toBe("À risque");
    expect(translations["level.team"].fr).toBe("Équipe");
    expect(translations["status.completed"].fr).toBe("Terminé");
    expect(translations["periods.title"].fr).toBe("Périodes");
    expect(translations["settings.title"].fr).toBe("Paramètres");
  });
});
