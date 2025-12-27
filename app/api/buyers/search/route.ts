// app/api/buyers/search/route.ts
/**
 * Buyer search endpoint (NO n8n).
 *
 * GET /api/buyers/search?q=...
 * Returns:
 *   { buyers: Buyer[] }
 *
 * Notes:
 * - User-scoped: only returns buyers belonging to the authenticated user
 * - Designed to support "select buyer" (returns enough fields to populate the form)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { neon } from "@neondatabase/serverless";

const QuerySchema = z.object({
  q: z.string().optional().default(""),
});

function getUserIdFromRequest(req: NextRequest): string | null {
  // Replace with your real auth/session integration.
  // This assumes a trusted middleware/header.
  const userId = req.headers.get("x-jora-user-id");
  return userId && userId.trim() ? userId.trim() : null;
}

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = QuerySchema.safeParse({
    q: req.nextUrl.searchParams.get("q") ?? "",
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const q = parsed.data.q.trim();
  if (!q) {
    return NextResponse.json({ buyers: [] });
  }

  const sql = neon(process.env.DATABASE_URL!);

  try {
    // IMPORTANT:
    // We return enough fields to fully populate BuyerForm on selection.
    // Adjust column names ONLY if your buyers table differs.
    const rows = await sql<
      {
        id: number;
        full_name: string;
        street: string;
        street_no: string | null;
        zip: string;
        city: string;
        phone: string;
        email: string | null;
        document_number: string | null;
        document_authority: string | null;
      }[]
    >`
      SELECT
        id,
        full_name,
        street,
        street_no,
        zip,
        city,
        phone,
        email,
        document_number,
        document_authority
      FROM buyers
      WHERE user_id = ${userId}
        AND (
          full_name ILIKE ${"%" + q + "%"}
          OR phone ILIKE ${"%" + q + "%"}
          OR COALESCE(email, '') ILIKE ${"%" + q + "%"}
          OR COALESCE(document_number, '') ILIKE ${"%" + q + "%"}
        )
      ORDER BY full_name ASC
      LIMIT 20
    `;

    return NextResponse.json({ buyers: rows });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
