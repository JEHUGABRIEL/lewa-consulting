import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getActiveSessionFromRequest } from "@/lib/admin/auth";

export const bodySizeLimit = "10mb";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_TYPES = /^image\/(png|jpe?g|webp|avif|gif)$/i;
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await getActiveSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return NextResponse.json(
      { error: "Stockage d'images non configuré sur le serveur." },
      { status: 503 },
    );
  }

  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File) || !file.size) {
      return NextResponse.json({ error: "Fichier manquant." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.test(file.type)) {
      return NextResponse.json(
        { error: "Format non accepté (PNG, JPG, WEBP, AVIF, GIF)." },
        { status: 400 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Image trop volumineuse (8 Mo maximum)." },
        { status: 400 },
      );
    }

    const publicId = `admin/uploads/${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise<{ secure_url?: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { public_id: publicId, resource_type: "auto", overwrite: false },
        (error, resultData) => {
          if (error) reject(error);
          else resolve(resultData ?? {});
        },
      );
      stream.end(buffer);
    });

    if (!result.secure_url) {
      throw new Error("Cloudinary n'a pas retourné d'URL.");
    }

    return NextResponse.json({ url: result.secure_url });
  } catch (err) {
    console.error("[admin] upload failed:", err);
    return NextResponse.json({ error: "Échec de l'import de l'image." }, { status: 500 });
  }
}
