// app/api/ocr/upload/route.ts
/**
 * OCR upload endpoint (NO n8n).
 *
 * POST /api/ocr/upload
 * Body: multipart/form-data with `file`
 * Returns: { file_url: string }
 *
 * Upload strategy:
 * - Upload to Backblaze B2 via S3-compatible API (recommended)
 * - Store under: ocr/<userId>/<uuid>_<originalName>
 *
 * Required env vars:
 * - DATABASE_URL (already used elsewhere)
 * - B2_S3_ENDPOINT          e.g. https://s3.<region>.backblazeb2.com
 * - B2_S3_REGION            e.g. us-east-005 (or your region)
 * - B2_ACCESS_KEY_ID
 * - B2_SECRET_ACCESS_KEY
 * - B2_BUCKET
 * - B2_PUBLIC_BASE_URL      OPTIONAL (if your bucket is public or you have a CDN)
 *
 * Notes:
 * - If your bucket is private, you should return a signed URL instead.
 *   For now we return a "public-style" URL using B2_PUBLIC_BASE_URL if provided.
 */

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const runtime = "nodejs";

function getUserIdFromRequest(req: NextRequest): string | null {
  const userId = req.headers.get("x-jora-user-id");
  return userId && userId.trim() ? userId.trim() : null;
}

const AllowedMime = z.enum([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

function safeFilename(name: string) {
  // Keep it boring: remove weird chars
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function buildFileUrl(key: string) {
  const base = process.env.B2_PUBLIC_BASE_URL?.replace(/\/+$/, "");
  if (base) return `${base}/${key}`;
  // Fallback best-effort (works if bucket is public in S3 endpoint style setups)
  // If this isn't valid for your config, set B2_PUBLIC_BASE_URL.
  return `https://${process.env.B2_BUCKET}.s3.${process.env.B2_S3_REGION}.backblazeb2.com/${key}`;
}

const s3 = new S3Client({
  region: process.env.B2_S3_REGION,
  endpoint: process.env.B2_S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.B2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.B2_SECRET_ACCESS_KEY || "",
  },
});

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, error: "Missing file" },
      { status: 400 }
    );
  }

  const mime = file.type || "application/octet-stream";
  const mimeCheck = AllowedMime.safeParse(mime);
  if (!mimeCheck.success) {
    return NextResponse.json(
      { success: false, error: "Unsupported file type" },
      { status: 400 }
    );
  }

  // Optional file size limit (adjust as needed)
  const maxBytes = 15 * 1024 * 1024; // 15MB
  if (file.size > maxBytes) {
    return NextResponse.json(
      { success: false, error: "File too large" },
      { status: 413 }
    );
  }

  const original = safeFilename(file.name || "document");
  const key = `ocr/${userId}/${randomUUID()}_${original}`;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const body = Buffer.from(arrayBuffer);

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.B2_BUCKET!,
        Key: key,
        Body: body,
        ContentType: mime,
      })
    );

    return NextResponse.json({
      success: true,
      file_url: buildFileUrl(key),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}
