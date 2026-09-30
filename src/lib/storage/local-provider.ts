import { createHmac, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { getConfig } from "@/lib/config";
import type { SaveFileInput, StorageProvider, StoredFile } from "@/lib/storage/provider";

export function verifyLocalSignature(key: string, expires: string, signature: string): boolean { const expected = createHmac("sha256", getConfig().STORAGE_SIGNING_SECRET).update(`${key}:${expires}`).digest("hex"); return Number(expires) > Math.floor(Date.now() / 1000) && signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected)); }
export class LocalStorageProvider implements StorageProvider {
  private root = path.resolve(getConfig().LOCAL_STORAGE_ROOT);
  private async save(input: SaveFileInput, prefix: string): Promise<StoredFile> { const key = `${prefix}/${input.userId}/${crypto.randomUUID()}${path.extname(input.filename).toLowerCase() || ".bin"}`; const fullPath = path.join(this.root, key); await mkdir(path.dirname(fullPath), { recursive: true }); await writeFile(fullPath, input.data, { flag: "wx" }); return { provider: "local", storageKey: key, byteSize: input.data.byteLength, mimeType: input.mimeType }; }
  saveOriginal(input: SaveFileInput) { return this.save(input, "originals"); }
  saveGenerated(input: SaveFileInput) { return this.save(input, "generated"); }
  async getSecureUrl(storageKey: string, expiresInSeconds: number): Promise<string> { const expires = String(Math.floor(Date.now() / 1000) + expiresInSeconds); const signature = createHmac("sha256", getConfig().STORAGE_SIGNING_SECRET).update(`${storageKey}:${expires}`).digest("hex"); return `/api/visualization/files?key=${encodeURIComponent(storageKey)}&expires=${expires}&signature=${signature}`; }
  async delete(storageKey: string) { try { await unlink(path.join(this.root, storageKey)); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; } }
  read(storageKey: string) { return readFile(path.join(this.root, storageKey)); }
}
