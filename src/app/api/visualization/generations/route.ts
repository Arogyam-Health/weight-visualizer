import { z } from "zod";
import { calculateEligibility, CATEGORY_DEFINITIONS } from "@/domain/eligibility";
import { getConfig } from "@/lib/config";
import { requireStoredUser } from "@/lib/auth/server-auth";
import { AppError, errorResponse } from "@/lib/errors";
import { getAdminClient } from "@/lib/supabase/admin";

const schema = z.object({ uploadId: z.string().uuid(), heightCm: z.number(), weightKg: z.number(), categoryCode: z.enum(["LOSS_3_5", "LOSS_6_10", "LOSS_10_15"]), user_id: z.string().uuid(), phone: z.string().min(1) });

export async function POST(request: Request) {
  try {
    const idempotency = request.headers.get("idempotency-key");
    if (!idempotency || !z.string().uuid().safeParse(idempotency).success) throw new AppError("IDEMPOTENCY_CONFLICT", "A UUID Idempotency-Key is required");
    const body = schema.parse(await request.json());
    const user = await requireStoredUser(request, { userId: body.user_id, phone: body.phone });
    const db = getAdminClient();
    const { data: upload, error: uploadError } = await db.from("wv_image_uploads").select("id,status,expires_at").eq("id", body.uploadId).eq("user_id", user.id).single();
    if (uploadError || !upload) throw new AppError("UPLOAD_EXPIRED", "Upload not found", 404);
    if (upload.status !== "ACTIVE" || new Date(upload.expires_at) <= new Date()) throw new AppError("UPLOAD_EXPIRED", "Upload has expired");
    const eligibility = calculateEligibility(body.heightCm, body.weightKg, getConfig().MIN_RESULTING_BMI);
    const category = eligibility.categories.find((item) => item.code === body.categoryCode);
    if (!category?.eligible) throw new AppError("CATEGORY_NOT_ELIGIBLE", "Selected category is not eligible");
    const definition = CATEGORY_DEFINITIONS.find((item) => item.code === body.categoryCode);
    if (!definition) throw new AppError("CATEGORY_NOT_ELIGIBLE", "Selected category is invalid");
    const { data, error } = await db.rpc("wv_reserve_generation", { p_user_id: user.id, p_upload_id: body.uploadId, p_category_code: body.categoryCode, p_requested_min: definition.min, p_requested_max: definition.max, p_effective_max: category.effectiveMaximumKg, p_height_cm: body.heightCm, p_weight_kg: body.weightKg, p_bmi: eligibility.bmi, p_provider: getConfig().IMAGE_GENERATION_PROVIDER, p_idempotency_key: idempotency, p_expires_at: new Date(Date.now() + getConfig().VISUALIZATION_RETENTION_DAYS * 86400000).toISOString() });
    if (error) { const code = error.message.includes("CATEGORY_LIMIT") ? "CATEGORY_LIMIT_REACHED" : error.message.includes("DAILY_LIMIT") ? "DAILY_LIMIT_REACHED" : "INTERNAL_ERROR"; throw new AppError(code, code === "INTERNAL_ERROR" ? "Generation could not be created" : "Generation limit reached", code === "INTERNAL_ERROR" ? 500 : 429); }
    return Response.json({ data }, { status: 202 });
  } catch (error) { return errorResponse(error); }
}
