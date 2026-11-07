"use server";

import { revalidatePath } from "next/cache";
import { promises as fs } from "fs";
import path from "path";
import { updateHomepageImage, resetHomepageImage } from "@/lib/db/homepage-images";
import type { ImageKey } from "@/lib/db/homepage-images";

export async function updateHomepageImageAction(key: ImageKey, url: string) {
  await updateHomepageImage(key, url);
  revalidatePath("/");
}

export async function resetHomepageImageAction(key: ImageKey) {
  await resetHomepageImage(key);
  revalidatePath("/");
}

/**
 * Upload file gambar ke folder public/uploads dan simpan URL-nya
 */
export async function uploadHomepageImageAction(
  key: ImageKey,
  formData: FormData
): Promise<{ url: string }> {
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `${key}-${Date.now()}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, filename), buffer);

  const url = `/uploads/${filename}`;
  await updateHomepageImage(key, url);
  revalidatePath("/");

  return { url };
}
