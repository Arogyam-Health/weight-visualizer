export type GenerationInput = { original: Buffer; categoryCode: string; requestedMinLossKg: number; requestedMaxLossKg: number; effectiveMaxLossKg: number; heightCm: number; weightKg: number; bmi: number };
export type GenerationOutput = { data: Buffer; mimeType: string; providerJobId?: string };
export interface ImageGenerationProvider { generate(input: GenerationInput): Promise<GenerationOutput>; }
