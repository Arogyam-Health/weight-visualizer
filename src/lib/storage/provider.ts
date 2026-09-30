export type SaveFileInput = { data: Buffer; mimeType: string; filename: string; userId: string; uploadId?: string };
export type StoredFile = { provider: string; storageKey: string; byteSize: number; mimeType: string };
export interface StorageProvider { saveOriginal(input: SaveFileInput): Promise<StoredFile>; saveGenerated(input: SaveFileInput): Promise<StoredFile>; getSecureUrl(storageKey: string, expiresInSeconds: number): Promise<string>; delete(storageKey: string): Promise<void>; read(storageKey: string): Promise<Buffer>; }
