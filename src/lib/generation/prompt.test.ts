import { buildVisualizationPrompt, getVisualIntensity } from "@/lib/generation/prompt";

const input = {
  categoryCode: "LOSS_6_10",
  requestedMinLossKg: 6,
  requestedMaxLossKg: 10,
  effectiveMaxLossKg: 10,
  heightCm: 170,
  weightKg: 85,
  bmi: 29.41,
} as const;

describe("buildVisualizationPrompt", () => {
  it("restores the compact prompt wording", () => {
    const prompt = buildVisualizationPrompt(input);
    expect(prompt).toContain("Edit the provided full-body photo of a single adult person.");
    expect(prompt).toContain("Apply a moderate but realistic visible reduction.");
    expect(prompt).toContain("Do not add muscle size or definition, visible abs, athletic or bodybuilding features");
    expect(prompt).not.toContain("BMI");
    expect(prompt).not.toContain("medically plausible");
  });

  it("uses the backend-capped maximum", () => {
    const prompt = buildVisualizationPrompt({ ...input, categoryCode: "LOSS_10_15", requestedMinLossKg: 10, requestedMaxLossKg: 15, effectiveMaxLossKg: 12.4 });
    expect(prompt).toContain("realistic visible reduction in overall body volume and silhouette");
    expect(prompt).not.toContain("10-12.4 kg");
    expect(prompt).not.toContain("10-15 kg");
  });

  it.each([
    ["LOSS_3_5", "MILD"],
    ["LOSS_6_10", "MODERATE"],
    ["LOSS_10_15", "CLEARLY NOTICEABLE"],
  ])("maps %s to %s", (categoryCode, intensity) => {
    expect(getVisualIntensity(categoryCode)).toBe(intensity);
  });
});
