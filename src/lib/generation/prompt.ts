import type { GenerationInput } from "@/lib/generation/provider";

const bandModifier: Record<string, string> = {
  LOSS_3_5: "Apply only a mild and subtle visible reduction.",
  LOSS_6_10: "Apply a moderate but realistic visible reduction.",
  LOSS_10_15: "Apply a clearly noticeable but still realistic reduction, without making the subject appear underweight or unnaturally slim.",
};

export function buildVisualizationPrompt(input: Pick<GenerationInput, "categoryCode" | "requestedMinLossKg" | "requestedMaxLossKg" | "effectiveMaxLossKg" | "heightCm" | "weightKg" | "bmi">): string {
  const intensity = bandModifier[input.categoryCode] ?? "Apply a subtle, realistic visible reduction.";
  return `Edit the provided full-body photo of a single adult person. Preserve the person's exact recognizable identity, face, facial structure, skin tone, apparent age, hairstyle, facial expression, clothing, pose, camera angle, camera distance, framing, lighting, background, and overall scene. Create a photorealistic version of the same person with a realistic visible reduction in overall body volume and silhouette. This is a visual appearance edit only. It does not represent an exact physical outcome. Modify only natural soft-tissue volume and silhouette changes. Keep the person's height, skeletal frame, muscle size, expression, and general body type unchanged. The clothing must remain the same clothing, including color, design, print, logo, sleeve length, coverage, and construction; it may only drape slightly looser because of the reduced volume. ${intensity} The visual difference must be clearly visible for this category while remaining natural and believable. Do not change age. Do not change skin texture unnaturally. Do not sharpen or beautify the face. Do not change hairstyle or expression. Do not recolor, replace, redesign, shorten, remove, or otherwise alter clothing. Do not change pose, hand position, arm position, leg position, camera framing, camera angle, lighting, or background. Do not add muscle size or definition, visible abs, athletic or bodybuilding features, broader shoulders, larger arms, or a fitness makeover. Do not create unrealistic proportions, anatomy, body shape, or garment artifacts. Do not add text, labels, measurements, borders, before/after graphics, or advertisement elements. The result must remain a believable photograph of the same person in the same scene with only a realistic visual reduction in body volume.`;
}

// Compatibility alias for callers using the newer builder name.
export const buildWeightLossPrompt = buildVisualizationPrompt;

export function getVisualIntensity(categoryCode: string): string {
  if (categoryCode === "LOSS_3_5") return "MILD";
  if (categoryCode === "LOSS_6_10") return "MODERATE";
  if (categoryCode === "LOSS_10_15") return "CLEARLY NOTICEABLE";
  throw new Error("Unsupported visualization category");
}
