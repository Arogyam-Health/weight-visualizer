import { buildWeightLossPrompt, getVisualIntensity } from "@/lib/generation/prompt";

describe("buildWeightLossPrompt", () => {
  it("builds the lowest category", () => {
    const prompt = buildWeightLossPrompt({ categoryCode: "LOSS_3_5", effectiveMinimumKg: 3, effectiveMaximumKg: 5 });
    expect(getVisualIntensity("LOSS_3_5")).toBe("LOWEST_CATEGORY");
    expect(prompt).toContain("LOWEST CATEGORY — MILD BUT CLEARLY VISIBLE");
    expect(prompt).toContain("This output must remain the smallest visible transformation in the system.");
  });

  it("builds the medium category", () => {
    const prompt = buildWeightLossPrompt({ categoryCode: "LOSS_6_10", effectiveMinimumKg: 6, effectiveMaximumKg: 10 });
    expect(getVisualIntensity("LOSS_6_10")).toBe("MEDIUM_CATEGORY");
    expect(prompt).toContain("MEDIUM CATEGORY — CLEARLY NOTICEABLE AND STRONGER THAN 3–5 KG");
    expect(prompt).toContain("This output must be visibly stronger than the 3–5 kg category and must not be confusable with it.");
  });

  it("builds the highest category", () => {
    const prompt = buildWeightLossPrompt({ categoryCode: "LOSS_10_15", effectiveMinimumKg: 10, effectiveMaximumKg: 15 });
    expect(getVisualIntensity("LOSS_10_15")).toBe("HIGHEST_CATEGORY");
    expect(prompt).toContain("HIGHEST CATEGORY — STRONGEST BODY-FAT REDUCTION, BUT STILL REALISTIC");
    expect(prompt).toContain("The midsection must show a clear and obvious reduction.");
    expect(prompt).toContain("The torso width must show a clear and obvious reduction.");
    expect(prompt).toContain("It must not be visually confusable with the 3–5 kg or 6–10 kg categories.");
  });

  it("uses the backend-approved capped range", () => {
    const prompt = buildWeightLossPrompt({ categoryCode: "LOSS_10_15", effectiveMinimumKg: 10, effectiveMaximumKg: 12.4 });
    expect(prompt).toContain("Approximately 10–12.4 kg lower body weight.");
    expect(prompt).not.toContain("Approximately 10–15 kg lower body weight.");
  });

  it("includes clothing locks and anti-artifact rules", () => {
    const prompt = buildWeightLossPrompt({ categoryCode: "LOSS_6_10", effectiveMinimumKg: 6, effectiveMaximumKg: 10 });
    expect(prompt).toContain("CLOTHING LOCK — HARD CONSTRAINT");
    expect(prompt).toContain("same sleeve length");
    expect(prompt).toContain("same garment construction");
    expect(prompt).toContain("Exact clothing color preservation is mandatory.");
    expect(prompt).toContain("ANTI-ARTIFACT RULES");
    expect(prompt).toContain("unintended skin-like marks showing through the fabric");
    expect(prompt).toContain("random dark spots or dots on the shirt");
    expect(prompt).toContain("transparency artifacts");
    expect(prompt).toContain("FINAL COMPARISON REQUIREMENT");
    expect(prompt).toContain("POSE LOCK — HARD CONSTRAINT");
    expect(prompt).toContain("whether each hand is inside or outside a pocket");
    expect(prompt).toContain("exact pocket interaction");
    expect(prompt).toContain("same hand must remain inside the same pocket");
    expect(prompt).toContain("FINAL LOCKED-ATTRIBUTE RULE");
    expect(prompt).toContain("hand placement");
    expect(prompt).toContain("pocket interaction");
  });

  it("rejects unknown categories and invalid ranges", () => {
    expect(() => buildWeightLossPrompt({ categoryCode: "LOSS_UNKNOWN", effectiveMinimumKg: 6, effectiveMaximumKg: 10 })).toThrow("Unsupported visualization category");
    expect(() => buildWeightLossPrompt({ categoryCode: "LOSS_6_10", effectiveMinimumKg: 0, effectiveMaximumKg: 10 })).toThrow("Invalid effective weight-loss range");
    expect(() => buildWeightLossPrompt({ categoryCode: "LOSS_6_10", effectiveMinimumKg: 10, effectiveMaximumKg: 10 })).toThrow("Invalid effective weight-loss range");
    expect(() => buildWeightLossPrompt({ categoryCode: "LOSS_6_10", effectiveMinimumKg: Number.NaN, effectiveMaximumKg: 10 })).toThrow("Invalid effective weight-loss range");
  });

  it("does not emit invalid target values", () => {
    const prompt = buildWeightLossPrompt({ categoryCode: "LOSS_6_10", effectiveMinimumKg: 6, effectiveMaximumKg: 9.5 });
    expect(prompt).not.toMatch(/undefined|NaN|null/);
  });
});
