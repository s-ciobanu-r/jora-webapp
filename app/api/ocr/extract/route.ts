// app/api/ocr/extract/route.ts
/**
 * OCR extraction endpoint (NO n8n).
 *
 * POST /api/ocr/extract
 * Body: { file_url: string }
 * Returns:
 *   {
 *     extracted: { brand_model, vin, km, first_reg },
 *     confidence: { brand_model, vin, km, first_reg }
 *   }
 *
 * This endpoint is intentionally opinionated:
 * - It calls an external OCR/LLM service directly (OpenAI, etc.)
 * - It returns normalized, frontend-ready fields
 *
 * Required env vars (if using OpenAI):
 * - OPENAI_API_KEY
 * - OPENAI_OCR_MODEL (optional, default below)
 *
 * Notes:
 * - If your OCR is NOT OpenAI, replace `runOcrWithOpenAI()` implementation
 *   while preserving the input/output contract.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const BodySchema = z.object({
  file_url: z.string().url(),
});

function getUserIdFromRequest(req: NextRequest): string | null {
  const userId = req.headers.get("x-jora-user-id");
  return userId && userId.trim() ? userId.trim() : null;
}

type Confidence = "low" | "medium" | "high";

type ExtractResponse = {
  extracted: {
    brand_model: string | null;
    vin: string | null;
    km: number | null;
    first_reg: string | null; // ISO YYYY-MM-DD
  };
  confidence: {
    brand_model: Confidence;
    vin: Confidence;
    km: Confidence;
    first_reg: Confidence;
  };
};

function normalizeVin(v: string | null): string | null {
  if (!v) return null;
  const vin = v.trim().toUpperCase();
  return vin || null;
}

function normalizeIsoDate(v: string | null): string | null {
  if (!v) return null;
  const s = v.trim();
  if (!s) return null;

  // Accept already-ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // Accept DD.MM.YYYY -> YYYY-MM-DD
  const m = s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (m) {
    const [, dd, mm, yyyy] = m;
    return `${yyyy}-${mm}-${dd}`;
  }

  return null;
}

function clampKm(v: any): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : Number(String(v).replace(/[^\d]/g, ""));
  if (!Number.isFinite(n)) return null;
  const i = Math.round(n);
  if (i <= 0) return null;
  if (i > 1_500_000) return null;
  return i;
}

/**
 * Minimal OpenAI implementation using a vision-capable model.
 * Replace this if you use a different OCR vendor/service.
 */
async function runOcrWithOpenAI(fileUrl: string): Promise<ExtractResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OCR not configured");
  }

  // Default to a vision model. You can set OPENAI_OCR_MODEL in env.
  const model = process.env.OPENAI_OCR_MODEL || "gpt-4.1-mini";

  const system = `
You extract vehicle purchase contract data from an uploaded vehicle document.
Return STRICT JSON only, no markdown, no comments.

Schema:
{
  "brand_model": string|null,
  "vin": string|null,
  "km": number|null,
  "first_reg": string|null,   // prefer ISO YYYY-MM-DD, otherwise DD.MM.YYYY
  "confidence": {
    "brand_model": "low"|"medium"|"high",
    "vin": "low"|"medium"|"high",
    "km": "low"|"medium"|"high",
    "first_reg": "low"|"medium"|"high"
  }
}

Rules:
- VIN must be 17 chars if present.
- km must be a number (integer) if present.
- If uncertain, output null and confidence "low".
`;

  const user = [
    {
      type: "text",
      text: "Extract the fields from this vehicle document image/PDF.",
    },
    {
      type: "image_url",
      image_url: { url: fileUrl },
    },
  ];

  // Use the Responses API format (works with modern OpenAI SDK-less calls)
  const resp = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      // Encourage JSON-only output
      text: { format: { type: "json_object" } },
    }),
  });

  if (!resp.ok) {
    throw new Error("OCR request failed");
  }

  const data = await resp.json();

  // Responses API returns content in output[0].content[0].text for json_object format
  const text =
    data?.output?.[0]?.content?.find((c: any) => c.type === "output_text")
      ?.text ??
    data?.output_text ??
    null;

  if (!text) {
    throw new Error("OCR parse failed");
  }

  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("OCR JSON invalid");
  }

  const brand_model = typeof parsed.brand_model === "string" ? parsed.brand_model.trim() : null;
  const vin = normalizeVin(typeof parsed.vin === "string" ? parsed.vin : null);
  const km = clampKm(parsed.km);
  const first_reg = normalizeIsoDate(typeof parsed.first_reg === "string" ? parsed.first_reg : null);

  const confidence = parsed.confidence ?? {};
  const conf = (k: string): Confidence =>
    confidence[k] === "high" || confidence[k] === "medium" || confidence[k] === "low"
      ? confidence[k]
      : "low";

  return {
    extracted: {
      brand_model: brand_model || null,
      vin,
      km,
      first_reg,
    },
    confidence: {
      brand_model: conf("brand_model"),
      vin: conf("vin"),
      km: conf("km"),
      first_reg: conf("first_reg"),
    },
  };
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }

  try {
    const out = await runOcrWithOpenAI(body.file_url);
    return NextResponse.json(out);
  } catch {
    return NextResponse.json(
      { success: false, error: "OCR failed" },
      { status: 500 }
    );
  }
}
