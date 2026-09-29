import { getStorageProvider } from "@/lib/storage/factory";
import { verifyLocalSignature } from "@/lib/storage/local-provider";
import { errorResponse, AppError } from "@/lib/errors";

export async function GET(request: Request) { try { const url = new URL(request.url); const key = url.searchParams.get("key"); const expires = url.searchParams.get("expires"); const signature = url.searchParams.get("signature"); if (!key || !expires || !signature || !verifyLocalSignature(key, expires, signature)) throw new AppError("AUTH_REQUIRED", "Invalid or expired file URL", 401); const data = await getStorageProvider().read(key); return new Response(new Uint8Array(data), { headers: { "content-type": "image/jpeg", "cache-control": "private, max-age=60" } }); } catch (error) { return errorResponse(error); } }
