import type { CategoryCode } from "@/domain/eligibility";

export type WeightLossPromptInput = {
  categoryCode: CategoryCode | string;
  effectiveMinimumKg: number;
  effectiveMaximumKg: number;
};

export type VisualIntensity = "LOWEST_CATEGORY" | "MEDIUM_CATEGORY" | "HIGHEST_CATEGORY";

export const VISUALIZATION_INTENSITY: Record<CategoryCode, VisualIntensity> = {
  LOSS_3_5: "LOWEST_CATEGORY",
  LOSS_6_10: "MEDIUM_CATEGORY",
  LOSS_10_15: "HIGHEST_CATEGORY",
};

export const BASE_PROMPT = `Edit the provided full-body photograph of the SAME adult person.

PURPOSE:
Create a photorealistic visualization of the same person after a realistic reduction in visible body-fat volume.

THIS IS A BODY-FAT / BODY-VOLUME EDIT ONLY.

It is NOT:
- a fitness transformation
- a bodybuilding transformation
- an athletic makeover
- a muscle-building transformation
- a body recomposition edit

MANDATORY RESULT:
The output must show a visible reduction in overall body volume and body silhouette according to the requested category.

A result where the body looks almost unchanged is NOT acceptable.

Preserve exactly the same person and overall scene.

IDENTITY MUST REMAIN THE SAME:
Preserve:
- facial identity
- facial structure
- skin tone
- apparent age
- hairstyle
- beard / facial hair
- expression

The final person must remain unmistakably the same individual.

POSE AND SCENE MUST REMAIN THE SAME:
Preserve:
- exact pose
- hand position
- arm position
- leg position
- body orientation
- height
- camera angle
- camera distance
- framing
- lighting
- background
- shadows
- overall composition

ONLY CHANGE BODY-FAT / SOFT-TISSUE VOLUME:
Modify only visible soft-tissue/body-fat volume.

Reduce proportionally, where appropriate, across visible areas of soft-tissue fullness:
- midsection projection
- waistline fullness
- lower torso fullness
- side fullness
- upper-torso fullness
- hip and lower-body fullness
- limb soft-tissue fullness
- mild facial fullness

The reduction must be naturally distributed across the body.

Do not reduce only one body part disproportionately.

Do not only make the face thinner while leaving the body unchanged.

Do not leave the midsection projection almost unchanged.
Do not leave the waistline almost unchanged.
Do not leave the torso width almost unchanged.

The person should remain the same natural body type and skeletal frame, just with lower visible body-fat volume.

ANTI-MUSCLE / ANTI-FITNESS RULES:
Do NOT interpret weight loss as:
- muscle gain
- increased muscle definition
- body recomposition
- broader shoulders
- larger arms
- pronounced arm muscle definition
- pronounced abdominal muscle definition
- pronounced upper-torso muscle definition
- a V-shaped torso
- a gym physique
- an athletic physique

The person's muscle mass, muscle definition, shoulder structure, skeletal frame, and general body type must remain unchanged.

The transformation must represent FAT LOSS ONLY, not muscle development.

Do not enlarge muscles to compensate for reduced fat.

Do not make the person look sporty, athletic, shredded, toned, sculpted, or bodybuilder-like.

The final image must remain photorealistic and believable.

It should look like the SAME person in the SAME photo setup, with only a realistic reduction in body-fat/body-volume.`;

export const CLOTHING_LOCK_BLOCK = `CLOTHING LOCK — HARD CONSTRAINT

The person's clothing is locked and must remain visually identical to the original photo.

Preserve exactly:
- same shirt
- same pants
- same shoes
- same sleeve length
- same sleeve coverage
- same neckline
- same collar shape
- same hem
- same seams
- same garment construction
- same fabric appearance
- same fit type
- same print/logo if present
- same color of every clothing item

Exact clothing color preservation is mandatory.

Do NOT:
- recolor the shirt
- recolor the pants
- recolor the shoes
- shift white to cream, beige, ivory, gray, or any other tone
- shift gray pants to blue, navy, black, brown, or any other tone
- change brightness/tint so much that the clothing looks like a different item
- replace clothing
- redesign clothing
- change fabric type
- change garment texture
- change sleeve coverage
- change neckline
- change pants style
- change shoe style
- expose more skin than in the original image

Do NOT:
- remove sleeves
- shorten sleeves
- roll sleeves
- convert a T-shirt into a sleeveless shirt
- expose shoulders that were originally covered
- expose upper arms more than the original garment does

The only allowed clothing change is a naturally slightly looser drape caused by reduced body volume underneath the same clothing.

If there is any conflict, preserving the original clothing identity and color is mandatory.`;

export const ANTI_ARTIFACT_BLOCK = `ANTI-ARTIFACT RULES

Clothing must remain opaque, clean, and visually natural.

Do NOT introduce:
- transparency artifacts
- unintended skin-like marks showing through the fabric
- random dark spots or dots on the shirt
- anatomy-like marks showing through the fabric
- unrealistic wrinkles
- melted fabric
- warped seams
- broken hems
- extra folds that look artificial
- fabric texture glitches
- shading artifacts that make the clothes look dirty or like a different material
- deformed hands
- deformed fingers
- deformed arms
- deformed legs
- distorted shoes
- distorted body edges
- ghosting
- duplicated body parts

Keep the garment appearance clean and realistic.

If preserving a clean result conflicts with making the transformation more dramatic, preserve a clean realistic garment appearance while still showing a visible body-fat reduction.`;

export const POSE_LOCK_BLOCK = `POSE LOCK — HARD CONSTRAINT

The person's pose must remain visually identical to the original image.

Preserve exactly:
- left arm position
- right arm position
- elbow angles
- wrist positions
- hand positions
- finger positions as far as visible
- whether each hand is inside or outside a pocket
- exact pocket interaction
- shoulder position
- torso orientation
- leg position
- foot placement
- head angle
- facial direction

If a hand is inside a pocket in the original image, that same hand must remain inside the same pocket in the generated image.

If both hands are in pockets in the original image, both hands must remain in pockets.

Do NOT:
- remove a hand from a pocket
- insert a hand into a pocket if it was originally outside
- change arm position
- change elbow angle
- change wrist position
- move hands across the body
- change stance
- reposition feet
- change shoulder posture
- change head position

Only body-fat / soft-tissue volume may change.

The skeletal pose and limb configuration must remain unchanged.`;

const CATEGORY_PROMPTS: Record<CategoryCode, (range: string) => string> = {
  LOSS_3_5: (range) => `TARGET TRANSFORMATION:
Approximately ${range} kg lower body weight.

CATEGORY:
3–5 kg visualization

BODY-FAT REDUCTION INTENSITY:
LOWEST CATEGORY — MILD BUT CLEARLY VISIBLE.

This must be the smallest transformation in the system.

Create a small but noticeable reduction in visible body-fat volume.

This represents early-stage weight loss.

Where appropriate, apply a mild reduction in:
- midsection projection
- waistline fullness
- side fullness
- lower torso fullness
- overall torso width
- hip and lower-body fullness
- limb soft-tissue fullness
- mild facial fullness

The person should still look broadly similar in body size, but visibly a little slimmer.

The body's outer silhouette must be slightly smaller than the original.

The midsection and waistline must show a small but visible reduction.

Do not make this transformation dramatic.

IMPORTANT:
This output must remain the smallest visible transformation in the system.
A result that is visually indistinguishable from the original is NOT acceptable.`,
  LOSS_6_10: (range) => `TARGET TRANSFORMATION:
Approximately ${range} kg lower body weight.

CATEGORY:
6–10 kg visualization

BODY-FAT REDUCTION INTENSITY:
MEDIUM CATEGORY — CLEARLY NOTICEABLE AND STRONGER THAN 3–5 KG.

This output must show more body-fat reduction than the 3–5 kg category.

Create a clearly visible reduction in visible body-fat volume.

Where appropriate, clearly reduce:
- midsection size
- forward projection of the midsection
- waistline circumference
- side fullness
- lower torso fullness
- overall torso width
- hip and lower-body volume
- limb soft-tissue fullness
- mild facial fullness

The midsection, waistline, and torso width must visibly change.

The body's outer silhouette must be clearly smaller than the original.

A viewer comparing the original and generated images should immediately notice that the person is slimmer.

Do not create:
- muscle definition
- athletic appearance
- sculpted physique
- visible abs
- unusually thin waist
- underweight appearance

Maintain the person's natural body type.

IMPORTANT:
This output must be visibly stronger than the 3–5 kg category and must not be confusable with it.
A result that looks only slightly different from the original is NOT acceptable for this category.`,
  LOSS_10_15: (range) => `TARGET TRANSFORMATION:
Approximately ${range} kg lower body weight.

CATEGORY:
10–15 kg visualization

BODY-FAT REDUCTION INTENSITY:
HIGHEST CATEGORY — STRONGEST BODY-FAT REDUCTION, BUT STILL REALISTIC.

This output must show the strongest visible body-fat reduction in the system.

It must be clearly stronger than both the 3–5 kg and 6–10 kg categories.

Create a substantial visible reduction in body-fat volume.

Where appropriate, clearly reduce:
- midsection bulk
- forward projection of the midsection
- waistline circumference
- side fullness
- lower torso width
- overall torso width
- hip and lower-body volume
- limb soft-tissue fullness
- lower-body bulk
- mild facial fullness

The complete outer body silhouette must be substantially smaller than the original.

The midsection must show a clear and obvious reduction.
The waistline must show a clear and obvious reduction.
The torso width must show a clear and obvious reduction.

The same clothing should remain unchanged in design and color, but may drape slightly more loosely over the reduced body.

Do NOT:
- make the person underweight
- create visible abs
- create muscle definition
- create broader shoulders
- create larger arms
- create a fitness/gym transformation
- distort anatomy
- change garment identity
- change garment color

IMPORTANT:
This output must not look like a mild transformation.
It must not be visually confusable with the 3–5 kg or 6–10 kg categories.
A result with only minor visible change is NOT acceptable for this category.`,
};

export const FINAL_COMPARISON_REQUIREMENT = `FINAL COMPARISON REQUIREMENT

When comparing the generated image directly with the original image:

- the generated body silhouette must look smaller
- the midsection must look smaller
- the waistline must look smaller
- the torso width must look smaller
- overall visible body-fat volume must look reduced

while:
- facial identity remains the same
- clothing remains the same
- clothing colors remain the same
- clothing construction remains the same
- pose remains the same
- background remains the same
- camera setup remains the same

Do not return an output where the only visible difference is slight facial slimming, random generation noise, lighting shift, or clothing color change.

The body-fat reduction itself must be visible.`;

export const FINAL_LOCKED_ATTRIBUTE_RULE = `FINAL LOCKED-ATTRIBUTE RULE:

The following attributes are immutable and must not change:
- identity
- face
- hairstyle
- clothing
- clothing color
- garment construction
- pose
- hand placement
- pocket interaction
- arm position
- leg position
- foot placement
- camera angle
- framing
- lighting
- background

The ONLY permitted transformation is a realistic reduction in visible body-fat / soft-tissue volume.

If the requested body-fat edit would cause any locked attribute to change, preserve the locked attribute and make a smaller body-fat edit instead.`;

function assertSupportedCategory(categoryCode: CategoryCode | string): asserts categoryCode is CategoryCode {
  if (!(categoryCode in VISUALIZATION_INTENSITY)) throw new Error("Unsupported visualization category");
}

function validateRange(minKg: number, maxKg: number): void {
  if (!Number.isFinite(minKg) || !Number.isFinite(maxKg) || minKg <= 0 || maxKg <= minKg) {
    throw new Error("Invalid effective weight-loss range");
  }
}

function formatKg(value: number): string {
  return Number(value.toFixed(2)).toString();
}

function formatRange(minKg: number, maxKg: number): string {
  return `${formatKg(minKg)}–${formatKg(maxKg)}`;
}

export function getVisualIntensity(categoryCode: CategoryCode | string): VisualIntensity {
  assertSupportedCategory(categoryCode);
  return VISUALIZATION_INTENSITY[categoryCode];
}

export function getCategoryInstructions(categoryCode: CategoryCode | string, minKg: number, maxKg: number): string {
  assertSupportedCategory(categoryCode);
  validateRange(minKg, maxKg);
  return CATEGORY_PROMPTS[categoryCode](formatRange(minKg, maxKg));
}

export function buildWeightLossPrompt(input: WeightLossPromptInput): string {
  assertSupportedCategory(input.categoryCode);
  validateRange(input.effectiveMinimumKg, input.effectiveMaximumKg);
  return [
    BASE_PROMPT,
    CLOTHING_LOCK_BLOCK,
    ANTI_ARTIFACT_BLOCK,
    POSE_LOCK_BLOCK,
    getCategoryInstructions(input.categoryCode, input.effectiveMinimumKg, input.effectiveMaximumKg),
    FINAL_COMPARISON_REQUIREMENT,
    FINAL_LOCKED_ATTRIBUTE_RULE,
  ].join("\n\n");
}

// Compatibility alias for callers that used the original builder name.
export const buildVisualizationPrompt = buildWeightLossPrompt;
