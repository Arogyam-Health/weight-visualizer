import type { GenerationInput, GenerationOutput, ImageGenerationProvider } from "@/lib/generation/provider";
export class DummyImageGenerationProvider implements ImageGenerationProvider { async generate(input: GenerationInput): Promise<GenerationOutput> { return { data: Buffer.from(input.original), mimeType: "image/jpeg", providerJobId: `dummy-${crypto.randomUUID()}` }; } }
