import { calculateEligibility } from "./eligibility";

describe("weight visualization eligibility", () => {
  test("calculates BMI and fully eligible categories", () => {
    const result = calculateEligibility(170, 85);
    expect(result.bmi).toBe(29.41);
    expect(result.maximumSafeLossKg).toBe(12.75);
    expect(result.categories[0].effectiveMaximumKg).toBe(5);
    expect(result.recommendedCategory).toBe("LOSS_3_5");
  });

  test("adjusts a partially eligible category", () => {
    const result = calculateEligibility(170, 77.5);
    expect(result.maximumSafeLossKg).toBe(5.25);
    expect(result.categories[0].eligible).toBe(true);
    expect(result.categories[1].eligible).toBe(false);
  });

  test("rejects invalid measurements and disables unsafe categories", () => {
    expect(() => calculateEligibility(99, 80)).toThrow("INVALID_HEIGHT");
    const result = calculateEligibility(170, 55);
    expect(result.categories.every((category) => !category.eligible)).toBe(true);
    expect(result.recommendedCategory).toBeNull();
  });

  test("uses the BMI 25 business bands", () => {
    expect(calculateEligibility(170, 75.25).categories.filter((category) => category.eligible).map((category) => category.code)).toEqual(["LOSS_3_5"]);
    expect(calculateEligibility(170, 78.25).categories.filter((category) => category.eligible).map((category) => category.code)).toEqual(["LOSS_3_5", "LOSS_6_10"]);
    expect(calculateEligibility(170, 82.25).categories.filter((category) => category.eligible).map((category) => category.code)).toEqual(["LOSS_3_5", "LOSS_6_10", "LOSS_10_15"]);
  });
});
