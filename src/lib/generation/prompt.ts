import type { GenerationInput } from "@/lib/generation/provider";

const bandModifier: Record<string, string> = {
  LOSS_3_5: "Apply only a mild and subtle visible reduction.",
  LOSS_6_10: "Apply a moderate but realistic visible reduction.",
  LOSS_10_15: "Apply a clearly noticeable but still realistic reduction, without making the subject appear underweight or unnaturally slim.",
};

export function buildVisualizationPrompt(input: Pick<GenerationInput, "categoryCode" | "requestedMinLossKg" | "requestedMaxLossKg" | "effectiveMaxLossKg" | "heightCm" | "weightKg" | "bmi">): string {
  const targetRange = `${input.requestedMinLossKg}-${input.effectiveMaxLossKg} kg`;
  return `Edit the provided full-body photo of a single person. Preserve the person’s identity, face, facial structure, skin tone, age, hairstyle, clothing, pose, camera angle, lighting, background, and overall scene. Create a photorealistic version of the same person showing a realistic and medically plausible reduction in body size corresponding to approximately ${targetRange} lower body weight. The person's current measurements for context are height ${input.heightCm} cm, weight ${input.weightKg} kg, and BMI ${input.bmi}. Modify only natural body-volume and silhouette changes that may occur with weight loss, mainly around the waist, abdomen, flanks, upper arms, thighs, hips, and mild facial fullness. Keep height, bone structure, expression, and general proportions unchanged. Clothing should remain the same, with only slight natural loosening if appropriate. ${bandModifier[input.categoryCode] ?? "Apply a subtle, realistic visible reduction."} Do not change age. Do not change skin texture unnaturally. Do not sharpen or beautify the face excessively. Do not change hairstyle. Do not change outfit color or design. Do not crop differently. Do not add abs or a gym body. Do not produce an unrealistic thin waist. Do not reduce only one body part disproportionately. Do not make the person muscular, underweight, younger, taller, cosmetically enhanced, airbrushed, or glamorized. Do not create before-after advertising graphics automatically. Keep the same plain single-image photo style. Do not change the background, pose, camera framing, clothing style, or facial identity. The result must look believable, subtle-to-moderate, and not exaggerated.`;
}

// Compatibility alias for callers using the newer builder name.
export const buildWeightLossPrompt = buildVisualizationPrompt;

export function getVisualIntensity(categoryCode: string): string {
  if (categoryCode === "LOSS_3_5") return "MILD";
  if (categoryCode === "LOSS_6_10") return "MODERATE";
  if (categoryCode === "LOSS_10_15") return "CLEARLY NOTICEABLE";
  throw new Error("Unsupported visualization category");
}
