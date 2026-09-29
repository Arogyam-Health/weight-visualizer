import { calculateEligibility } from "./eligibility";

describe("weight visualization eligibility", () => {
  test("calculates BMI and fully eligible categories", () => {
    const result = calculateEligibility(170, 85);
    expect(result.bmi).toBe(29.41);
    expect(result.categories[0].effectiveMaximumKg).toBe(5);
    expect(result.recommendedCategory).toBe("LOSS_3_5");
  });

  test("adjusts a partially eligible category", () => {
    const result = calculateEligibility(170, 77.5);
    expect(result.maximumSafeLossKg).toBe(24.04);
    expect(result.categories[2].effectiveMaximumKg).toBe(15);
  });

  test("rejects invalid measurements and disables unsafe categories", () => {
    expect(() => calculateEligibility(99, 80)).toThrow("INVALID_HEIGHT");
    const result = calculateEligibility(170, 55);
    expect(result.categories.every((category) => !category.eligible)).toBe(true);
    expect(result.recommendedCategory).toBeNull();
  });
});
