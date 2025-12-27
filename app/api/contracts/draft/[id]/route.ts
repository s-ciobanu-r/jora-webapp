// app/api/contracts/draft/[id]/route.ts
/**
 * Load a draft (NO n8n).
 *
 * GET /api/contracts/draft/:id
 * Returns:
 *   { success: true, id, payload, status, updated_at }
 *
 * Notes:
 * - Requires Neon Postgres.
 * - Drafts are user-scoped: you can only read your own.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { neon } from "@neondatabase/serverless";

const ParamsSchema = z.object({
  id: z.string().uuid(),
});

function getUserIdFromRequest(req: NextRequest): string | null {
  const userId = req.headers.get("x-jora-user-id");
  return userId && userId.trim() ? userId.trim() : null;
}

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  let id: string;
  try {
    id = ParamsSchema.parse(context.params).id;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid draft id" },
      { status: 400 }
    );
  }

  const sql = neon(process.env.DATABASE_URL!);

  try {
    const rows = await sql<
      {
        id: string;
        payload: unknown;
        status: string;
        updated_at: string;
      }[]
    >`
      SELECT
        id::text AS id,
        payload_json AS payload,
        status::text AS status,
        updated_at::text AS updated_at
      FROM contract_drafts
      WHERE id = ${id}::uuid
        AND user_id = ${userId}
      LIMIT 1
    `;

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Draft not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      id: rows[0].id,
      payload: rows[0].payload,
      status: rows[0].status,
      updated_at: rows[0].updated_at,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Database error" },
      { status: 500 }
    );
  }
}
