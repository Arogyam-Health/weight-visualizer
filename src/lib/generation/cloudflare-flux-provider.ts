import sharp from "sharp";
import { getConfig } from "@/lib/config";
import { visualizationDebug } from "@/lib/debug";
import { buildVisualizationPrompt, getVisualIntensity } from "@/lib/generation/prompt";
import type { GenerationInput, GenerationOutput, ImageGenerationProvider } from "@/lib/generation/provider";

type CloudflareResponse = { result?: { image?: string }; success?: boolean; errors?: Array<{ message?: string }> };

export class CloudflareFluxImageGenerationProvider implements ImageGenerationProvider {
  async generate(input: GenerationInput): Promise<GenerationOutput> {
    const config = getConfig();
    const modelInput = await sharp(input.original).rotate().resize({ width: 480, height: 480, fit: "contain", background: { r: 245, g: 245, b: 245, alpha: 1 } }).jpeg({ quality: 88 }).toBuffer();
    const prompt = buildVisualizationPrompt(input);
    visualizationDebug("prompt_generated", { categoryCode: input.categoryCode, effectiveMinimumKg: input.requestedMinLossKg, effectiveMaximumKg: input.effectiveMaxLossKg, visualIntensity: getVisualIntensity(input.categoryCode), provider: "cloudflare-flux", providerModel: config.CLOUDFLARE_MODEL, promptLength: prompt.length, ...(process.env.NODE_ENV !== "production" ? { prompt } : {}) });
    visualizationDebug("cloudflare_request_prepared", { model: config.CLOUDFLARE_MODEL, inputBytes: modelInput.byteLength, inputWidth: 480, inputHeight: 480, outputWidth: 768, outputHeight: 1024, promptLength: prompt.length });
    const form = new FormData();
    form.append("prompt", prompt);
    form.append("input_image_0", new Blob([new Uint8Array(modelInput)], { type: "image/jpeg" }), "input.jpg");
    form.append("width", "768");
    form.append("height", "1024");
    const startedAt = Date.now();
    visualizationDebug("cloudflare_request_started", { model: config.CLOUDFLARE_MODEL });
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${config.CLOUDFLARE_ACCOUNT_ID}/ai/run/${config.CLOUDFLARE_MODEL}`, { method: "POST", headers: { Authorization: `Bearer ${config.CLOUDFLARE_API_TOKEN}` }, body: form });
    const payload = await response.json() as CloudflareResponse;
    visualizationDebug("cloudflare_response_received", { model: config.CLOUDFLARE_MODEL, status: response.status, ok: response.ok, durationMs: Date.now() - startedAt, outputBase64Length: payload.result?.image?.length ?? 0, error: payload.errors?.[0]?.message?.slice(0, 200) });
    if (!response.ok || !payload.result?.image) throw new Error(payload.errors?.[0]?.message?.slice(0, 200) ?? `Cloudflare Workers AI request failed (${response.status})`);
    const output = Buffer.from(payload.result.image, "base64");
    visualizationDebug("cloudflare_image_decoded", { outputBytes: output.byteLength, mimeType: "image/jpeg" });
    return { data: output, mimeType: "image/jpeg", providerJobId: `cloudflare-${crypto.randomUUID()}` };
  }
}
