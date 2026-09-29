import { DummyImageGenerationProvider } from "@/lib/generation/dummy-provider";
import { CloudflareFluxImageGenerationProvider } from "@/lib/generation/cloudflare-flux-provider";
import { getConfig } from "@/lib/config";
import type { ImageGenerationProvider } from "@/lib/generation/provider";
export function getGenerationProvider(): ImageGenerationProvider { const provider = getConfig().IMAGE_GENERATION_PROVIDER; if (provider === "dummy") return new DummyImageGenerationProvider(); if (provider === "cloudflare-flux") return new CloudflareFluxImageGenerationProvider(); throw new Error("Unsupported generation provider"); }
