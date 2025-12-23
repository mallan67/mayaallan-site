/* src/app/api/admin/uploads/route.ts */
import { NextResponse } from "next/server";
import { requireAdminOrThrow } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  await requireAdminOrThrow();

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });

  const rawName = (form.get("filename")?.toString() ?? (file instanceof File ? file.name : `upload-${Date.now()}`));
  const safeName = rawName.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9_\\-\\.]/g, "").toLowerCase();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // S3 path if configured
  if (process.env.AWS_S3_BUCKET && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    try {
      const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
      const s3 = new S3Client({
        region: process.env.AWS_REGION ?? "us-east-1",
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      });

      const key = `uploads/${Date.now()}-${safeName}`;
      await s3.send(new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
        Body: buffer,
        ContentType: (file instanceof File && file.type) ? file.type : "application/octet-stream",
        ACL: "public-read",
      }));

      const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;
      return NextResponse.json({ ok: true, url });
    } catch (err: any) {
      console.error("S3 upload failed", err);
      return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
    }
  }

  // Disk fallback (local dev)
  try {
    const path = await import("path");
    const fs = await import("fs/promises");
    const outdir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(outdir, { recursive: true });
    const outname = `${Date.now()}-${safeName}`;
    const outPath = path.join(outdir, outname);
    await fs.writeFile(outPath, buffer);

    const site = (process.env.NEXT_PUBLIC_SITE_URL ?? `http://localhost:3000`).replace(/\/$/, "");
    const url = `${site}/uploads/${outname}`;
    return NextResponse.json({ ok: true, url });
  } catch (err: any) {
    console.error("Disk write failed", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
