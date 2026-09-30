import { getConfig } from "@/lib/config";
import { getGenerationProvider } from "@/lib/generation/factory";
import { getStorageProvider } from "@/lib/storage/factory";
import { getAdminClient } from "@/lib/supabase/admin";
import { visualizationDebug } from "@/lib/debug";

type PendingJob = { id: string; upload_id: string; category_code: string; requested_min_loss_kg: number; requested_max_loss_kg: number; effective_max_loss_kg: number; height_cm: number; weight_kg: number; bmi: number; attempt_count: number };

async function recoverTimedOutJobs() {
  await getAdminClient().from("wv_generation_jobs").update({ status: "FAILED", error_code: "WORKER_TIMEOUT", error_message: "Processing timed out", updated_at: new Date().toISOString() }).eq("status", "PROCESSING").lt("processing_started_at", new Date(Date.now() - 15 * 60_000).toISOString());
}

async function claimJob(jobId: string): Promise<PendingJob | null> {
  const db = getAdminClient();
  const { data: pending } = await db.from("wv_generation_jobs").select("id,upload_id,category_code,requested_min_loss_kg,requested_max_loss_kg,effective_max_loss_kg,height_cm,weight_kg,bmi,attempt_count").eq("id", jobId).eq("status", "PENDING").maybeSingle();
  if (!pending) return null;
  const { data: claimed } = await db.from("wv_generation_jobs").update({ status: "PROCESSING", processing_started_at: new Date().toISOString(), attempt_count: pending.attempt_count + 1, updated_at: new Date().toISOString() }).eq("id", jobId).eq("status", "PENDING").select("id,upload_id,category_code,requested_min_loss_kg,requested_max_loss_kg,effective_max_loss_kg,height_cm,weight_kg,bmi,attempt_count").maybeSingle();
  return claimed as PendingJob | null;
}

async function processClaimedJob(pending: PendingJob): Promise<boolean> {
  const db = getAdminClient();
  visualizationDebug("job_found", { jobId: pending.id, categoryCode: pending.category_code, attemptCount: pending.attempt_count });
  visualizationDebug("job_claimed", { jobId: pending.id, attemptCount: pending.attempt_count + 1 });
  try {
    const { data: upload, error } = await db.from("wv_image_uploads").select("storage_key,user_id,status").eq("id", pending.upload_id).single();
    if (error || !upload || upload.status !== "ACTIVE") throw new Error("UPLOAD_EXPIRED");
    const storage = getStorageProvider();
    visualizationDebug("original_loaded", { jobId: pending.id, storageProvider: upload.storage_key.split("/")[0], originalKeyType: "stored-key" });
    const output = await getGenerationProvider().generate({ original: await storage.read(upload.storage_key), categoryCode: pending.category_code, requestedMinLossKg: pending.requested_min_loss_kg, requestedMaxLossKg: pending.requested_max_loss_kg, effectiveMaxLossKg: pending.effective_max_loss_kg, heightCm: pending.height_cm, weightKg: pending.weight_kg, bmi: pending.bmi });
    visualizationDebug("provider_succeeded", { jobId: pending.id, providerJobId: output.providerJobId, outputBytes: output.data.byteLength, outputMimeType: output.mimeType });
    const saved = await storage.saveGenerated({ data: output.data, mimeType: output.mimeType, filename: `${pending.id}.jpg`, userId: upload.user_id, uploadId: pending.upload_id });
    await db.from("wv_generation_jobs").update({ status: "SUCCEEDED", provider_job_id: output.providerJobId, result_storage_key: saved.storageKey, completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", pending.id);
    visualizationDebug("job_succeeded", { jobId: pending.id, resultStorageProvider: saved.provider });
    return true;
  } catch (error) {
    visualizationDebug("job_failed", { jobId: pending.id, error: error instanceof Error ? error.message.slice(0, 200) : "unknown_error" });
    await db.from("wv_generation_jobs").update({ status: "FAILED", error_code: "PROVIDER_FAILED", error_message: error instanceof Error ? error.message.slice(0, 200) : "Provider failed", updated_at: new Date().toISOString() }).eq("id", pending.id);
    return true;
  }
}

export async function processJob(jobId: string): Promise<boolean> {
  await recoverTimedOutJobs();
  const claimed = await claimJob(jobId);
  return claimed ? processClaimedJob(claimed) : false;
}

export async function processOneJob(): Promise<boolean> {
  await recoverTimedOutJobs();
  const { data: pending } = await getAdminClient().from("wv_generation_jobs").select("id").eq("status", "PENDING").order("created_at", { ascending: true }).limit(1).maybeSingle();
  return pending ? processJob(pending.id) : false;
}

export async function runWorker() { const once = process.argv.includes("--once"); do { const processed = await processOneJob(); if (!processed && !once) await new Promise((resolve) => setTimeout(resolve, 1000)); if (!processed && once) break; } while (true); }
