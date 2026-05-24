import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const CLOUDINARY_API_BASE = "https://api.cloudinary.com/v1_1";

function getExtension(fileName: string, mimeType: string) {
  const existingExtension = path.extname(fileName).toLowerCase();
  if (existingExtension) return existingExtension;

  switch (mimeType) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    case "image/avif":
      return ".avif";
    default:
      return ".bin";
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Only image uploads are supported" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File is too large" }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET?.trim();
    const cloudinaryFolder = process.env.CLOUDINARY_FOLDER?.trim() || "hair/uploads";

    if (cloudName && uploadPreset) {
      const cloudinaryForm = new FormData();
      cloudinaryForm.append("file", file);
      cloudinaryForm.append("upload_preset", uploadPreset);
      cloudinaryForm.append("folder", cloudinaryFolder);

      const cloudinaryRes = await fetch(`${CLOUDINARY_API_BASE}/${cloudName}/image/upload`, {
        method: "POST",
        body: cloudinaryForm,
      });

      const cloudinaryData = await cloudinaryRes.json();

      if (!cloudinaryRes.ok || !cloudinaryData?.secure_url) {
        console.error("Cloudinary upload failed:", cloudinaryData);
        return NextResponse.json({ error: cloudinaryData?.error?.message || "Cloudinary upload failed" }, { status: 500 });
      }

      return NextResponse.json({
        url: cloudinaryData.secure_url,
        publicId: cloudinaryData.public_id,
        name: file.name,
        size: file.size,
        type: file.type,
        provider: "cloudinary",
      });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const extension = getExtension(file.name || "upload", file.type);
    const safeName = `${randomUUID()}${extension}`;
    const filePath = path.join(uploadDir, safeName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    return NextResponse.json({
      url: `/uploads/${safeName}`,
      name: safeName,
      size: file.size,
      type: file.type,
      provider: "local",
    });
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}