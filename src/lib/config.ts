import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  STORAGE_PROVIDER: z.enum(["local", "cloudinary"]).default("local"),
  LOCAL_STORAGE_ROOT: z.string().default("./storage"),
  STORAGE_SIGNING_SECRET: z.string().min(16),
  SECURE_URL_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_ASSET_TYPE: z.string().default("image"),
  IMAGE_GENERATION_PROVIDER: z.enum(["dummy", "cloudflare-flux"]).default("dummy"),
  CLOUDFLARE_ACCOUNT_ID: z.string().regex(/^[a-fA-F0-9]{32}$/).optional(),
  CLOUDFLARE_API_TOKEN: z.string().min(1).optional(),
  CLOUDFLARE_MODEL: z.string().default("@cf/black-forest-labs/flux-2-klein-4b"),
  VISUALIZATION_RETENTION_DAYS: z.coerce.number().int().positive().default(7),
  MIN_RESULTING_BMI: z.coerce.number().positive().default(18.5),
  MAX_UPLOAD_BYTES: z.coerce.number().int().positive().default(10485760),
  MIN_IMAGE_WIDTH: z.coerce.number().int().positive().default(512),
  MIN_IMAGE_HEIGHT: z.coerce.number().int().positive().default(512),
  WORKER_SECRET: z.string().optional(),
  CLEANUP_SECRET: z.string().optional(),
  ALLOWED_STOREFRONT_ORIGINS: z.string().default(""),
  CONSENT_POLICY_VERSION: z.string().default("wv-v1"),
});

export type AppConfig = z.infer<typeof envSchema>;
export function getConfig(): AppConfig {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
  if (parsed.data.STORAGE_PROVIDER === "cloudinary" && (!parsed.data.CLOUDINARY_CLOUD_NAME || !parsed.data.CLOUDINARY_API_KEY || !parsed.data.CLOUDINARY_API_SECRET)) throw new Error("Cloudinary configuration is required");
  if (parsed.data.IMAGE_GENERATION_PROVIDER === "cloudflare-flux" && (!parsed.data.CLOUDFLARE_ACCOUNT_ID || !parsed.data.CLOUDFLARE_API_TOKEN)) throw new Error("Cloudflare Workers AI configuration is required");
  return parsed.data;
}
