// app/api/contracts/finalize/route.ts
/**
 * Finalize Contract endpoint (SINGLE n8n CALL).
 *
 * POST /api/contracts/finalize
 *
 * Responsibilities:
 * - Authenticate user (server-side)
 * - Validate payload shape (basic sanity, NOT business rules)
 * - Enforce idempotency
 * - Proxy ONE request to n8n finalize webhook
 * - Persist idempotency result
 *
 * IMPORTANT:
 * - Frontend MUST NOT send user_id
 * - n8n is the ONLY place where irreversible actions happen
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { neon } from "@neondatabase/serverless";

const FinalizeSchema = z.object({
  contract: z.object({
    number: z.string().min(1),
    date: z.string().min(1),
  }),
  vehicle: z.object({
    brand_model: z.string().min(1),
    vin: z.string().length(17),
    km: z.number().positive(),
    first_reg: z.string().min(1),
    ocr_file_url: z.string().url().optional(),
  }),
  buyer: z.object({
    id: z.number().optional(),
    full_name: z.string().min(1),
    street: z.string().min(1),
    street_no: z.string().optional(),
    zip: z.string().min(1),
    city: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().email().optional(),
    document_number: z.string().min(1),
    document_authority: z.string().min(1),
  }),
  price: z.number().positive(),
  idempotency_key: z.string().min(8),
});

function getUserIdFromRequest(req: NextRequest): string | null {
  const userId = req.headers.get("x-jora-user-id");
  return userId && userId.trim() ? userId.trim() : null;
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  let payload: z.infer<typeof FinalizeSchema>;
  try {
    payload = FinalizeSchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid payload" },
      { status: 400 }
    );
  }

  const sql = neon(process.env.DATABASE_URL!);

  // ---- Idempotency check ----
  const existing = await sql<
    { response: any }[]
  >`
    SELECT response
    FROM contract_idempotency
    WHERE user_id = ${userId}
      AND idempotency_key = ${payload.idempotency_key}
    LIMIT 1
  `;

  if (existing.length > 0) {
    return NextResponse.json(existing[0].response);
  }

  // ---- Call n8n (single execution) ----
  const n8nResponse = await fetch(
    process.env.N8N_FINALIZE_WEBHOOK_URL!,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.N8N_API_KEY}`,
      },
      body: JSON.stringify({
        ...payload,
        user_id: userId, // SERVER-SIDE ONLY
      }),
    }
  );

  const result = await n8nResponse.json();

  if (!n8nResponse.ok) {
    return NextResponse.json(
      { success: false, error: result?.error || "Finalize failed" },
      { status: 502 }
    );
  }

  // ---- Store idempotency result ----
  await sql`
    INSERT INTO contract_idempotency (user_id, idempotency_key, response)
    VALUES (${userId}, ${payload.idempotency_key}, ${JSON.stringify(result)}::jsonb)
  `;

  return NextResponse.json(result);
}
