import { getConfig } from "@/lib/config";
import { LocalStorageProvider } from "@/lib/storage/local-provider";
import { CloudinaryStorageProvider } from "@/lib/storage/cloudinary-provider";
import type { StorageProvider } from "@/lib/storage/provider";

export function getStorageProvider(): StorageProvider { const config = getConfig(); if (config.STORAGE_PROVIDER === "local") return new LocalStorageProvider(); return new CloudinaryStorageProvider(); }
