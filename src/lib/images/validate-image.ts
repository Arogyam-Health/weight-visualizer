import sharp from "sharp";
import { createHash } from "node:crypto";
import { AppError } from "@/lib/errors";
import { getConfig } from "@/lib/config";

const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
export type ValidatedImage = { data: Buffer; mimeType: "image/jpeg"; width: number; height: number; byteSize: number; sha256: string };
export async function validateAndNormalizeImage(data: Buffer, claimedMimeType: string): Promise<ValidatedImage> {
  const config = getConfig();
  if (!data.byteLength || data.byteLength > config.MAX_UPLOAD_BYTES || !allowed.has(claimedMimeType)) throw new AppError("INVALID_IMAGE", "Unsupported or oversized image", 400);
  try { const normalized = await sharp(data, { animated: false }).rotate().jpeg({ quality: 90 }).toBuffer({ resolveWithObject: true }); const { width, height } = normalized.info; if (width < config.MIN_IMAGE_WIDTH || height < config.MIN_IMAGE_HEIGHT) throw new AppError("INVALID_IMAGE", "Image dimensions are too small", 400); return { data: normalized.data, mimeType: "image/jpeg", width, height, byteSize: normalized.data.byteLength, sha256: createHash("sha256").update(normalized.data).digest("hex") }; } catch (error) { if (error instanceof AppError) throw error; throw new AppError("INVALID_IMAGE", "The image could not be decoded", 400); }
}
