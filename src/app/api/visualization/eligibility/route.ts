import { z } from "zod";
import { calculateEligibility } from "@/domain/eligibility";
import { getConfig } from "@/lib/config";
import { requireStoredUser } from "@/lib/auth/server-auth";
import { errorResponse } from "@/lib/errors";
const schema = z.object({ heightCm: z.number(), weightKg: z.number(), user_id: z.string().uuid(), phone: z.string().min(1) });
export async function POST(request: Request) { try { const body = schema.parse(await request.json()); await requireStoredUser(request, { userId: body.user_id, phone: body.phone }); return Response.json({ data: calculateEligibility(body.heightCm, body.weightKg, getConfig().MIN_RESULTING_BMI) }); } catch (error) { return errorResponse(error); } }
