export const CATEGORY_DEFINITIONS = [
  { code: "LOSS_3_5", min: 3, max: 5 },
  { code: "LOSS_6_10", min: 6, max: 10 },
  { code: "LOSS_10_15", min: 10, max: 15 },
] as const;

export type CategoryCode = (typeof CATEGORY_DEFINITIONS)[number]["code"];

export type EligibilityCategory = {
  code: CategoryCode;
  nominalMinimumKg: number;
  nominalMaximumKg: number;
  effectiveMinimumKg: number;
  effectiveMaximumKg: number;
  eligible: boolean;
  reason?: string;
};

export type EligibilityResult = {
  bmi: number;
  maximumSafeLossKg: number;
  categories: EligibilityCategory[];
  recommendedCategory: CategoryCode | null;
};

const round = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

export function calculateEligibility(
  heightCm: number,
  weightKg: number,
  minimumResultingBmi = 18.5,
): EligibilityResult {
  if (!Number.isFinite(heightCm) || heightCm < 100 || heightCm > 250) throw new Error("INVALID_HEIGHT");
  if (!Number.isFinite(weightKg) || weightKg < 30 || weightKg > 350) throw new Error("INVALID_WEIGHT");
  if (!Number.isFinite(minimumResultingBmi) || minimumResultingBmi <= 0) throw new Error("INVALID_BMI_CONFIGURATION");

  const heightMeters = heightCm / 100;
  const bmi = round(weightKg / (heightMeters * heightMeters));
  const minimumAllowedWeight = minimumResultingBmi * heightMeters * heightMeters;
  const maximumSafeLossKg = round(Math.max(0, weightKg - minimumAllowedWeight));
  const categories = CATEGORY_DEFINITIONS.map((category) => {
    const effectiveMaximumKg = round(Math.min(category.max, maximumSafeLossKg));
    const eligible = effectiveMaximumKg >= category.min;
    return {
      code: category.code,
      nominalMinimumKg: category.min,
      nominalMaximumKg: category.max,
      effectiveMinimumKg: category.min,
      effectiveMaximumKg,
      eligible,
      ...(eligible ? {} : { reason: "This category would go below the minimum resulting BMI." }),
    };
  });
  const recommendedCategory = (categories.find((category) => category.eligible && category.code === "LOSS_3_5") ?? categories.find((category) => category.eligible))?.code ?? null;
  return { bmi, maximumSafeLossKg, categories, recommendedCategory };
}
