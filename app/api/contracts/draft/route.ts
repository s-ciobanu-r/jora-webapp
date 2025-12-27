// app/api/contracts/draft/route.ts
/**
 * Draft persistence endpoint (NO n8n).
 *
 * POST /api/contracts/draft
 * Body:
 *   { id: string|null, payload: object }
 *
 * Returns:
 *   { id: string, updated_at: string }
 *
 * Notes:
 * - Requires Neon Postgres.
 * - Assumes table: contract_drafts(id uuid pk, user_id, payload_json jsonb, status, updated_at)
 * - Auth: this route expects an authenticated user id to be derivable server-side.
 *
 * IMPORTANT:
 * - Frontend must NOT send user_id
 * - This route must infer user_id from auth (cookie/session) OR a trusted header added by middleware.
 *
 * Dependency required:
 *   npm i @neondatabase/serverless
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { neon } from "@neondatabase/serverless";

const DraftUpsertSchema = z.object({
  id: z.string().uuid().nullable(),
  payload: z.unknown(), // stored as JSONB; FE validates shape separately
});

function getUserIdFromRequest(req: NextRequest): string | null {
  /**
   * Replace this with your real auth integration.
   * For now, we support a trusted header that YOUR middleware must set.
   * Example middleware sets: x-jora-user-id: "<uuid-or-int>"
   */
  const userId = req.headers.get("x-jora-user-id");
  return userId && userId.trim() ? userId.trim() : null;
}

async function readJsonBody(req: NextRequest): Promise<unknown> {
  // sendBeacon often uses text/plain; NextRequest.json() can fail in some setups.
  try {
    return await req.json();
  } catch {
    const text = await req.text();
    return JSON.parse(text);
  }
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  let parsed: z.infer<typeof DraftUpsertSchema>;
  try {
    const body = await readJsonBody(req);
    parsed = DraftUpsertSchema.parse(body);
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  const sql = neon(process.env.DATABASE_URL!);

  try {
    if (parsed.id) {
      // Update existing draft (only if it belongs to this user)
      const rows = await sql<
        { id: string; updated_at: string }[]
      >`
        UPDATE contract_drafts
           SET payload_json = ${JSON.stringify(parsed.payload)}::jsonb,
               status = 'draft',
               updated_at = NOW()
         WHERE id = ${parsed.id}::uuid
           AND user_id = ${userId}
     RETURNING id::text AS id, updated_at::text AS updated_at
      `;

      if (!rows || rows.length === 0) {
        // Either draft doesn't exist or doesn't belong to user
        return NextResponse.json(
          { success: false, error: "Draft not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ id: rows[0].id, updated_at: rows[0].updated_at });
    }

    // Create new draft
    const rows = await sql<{ id: string; updated_at: string }[]>`
      INSERT INTO contract_drafts (user_id, payload_json, status, updated_at)
      VALUES (${userId}, ${JSON.stringify(parsed.payload)}::jsonb, 'draft', NOW())
      RETURNING id::text AS id, updated_at::text AS updated_at
    `;

    return NextResponse.json({ id: rows[0].id, updated_at: rows[0].updated_at });
  } catch (err) {
    // Avoid leaking internals
    return NextResponse.json(
      { success: false, error: "Database error" },
      { status: 500 }
    );
  }
}
