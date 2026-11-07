/**
 * Homepage Images — menggunakan file JSON lokal sebagai penyimpanan
 * Tidak perlu Supabase database, gambar disimpan di data/homepage-images.json
 */

import { promises as fs } from "fs";
import path from "path";
import { DEFAULT_IMAGES } from "@/lib/site-config";

export type ImageKey = keyof typeof DEFAULT_IMAGES;

const DATA_FILE = path.join(process.cwd(), "data", "homepage-images.json");

// ─── Read ────────────────────────────────────────────────────────────────────

export async function getHomepageImages(): Promise<Record<ImageKey, string>> {
  const result = { ...DEFAULT_IMAGES } as Record<ImageKey, string>;

  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const saved = JSON.parse(raw) as Partial<Record<ImageKey, string>>;
    for (const key of Object.keys(saved) as ImageKey[]) {
      if (key in result && saved[key]) {
        result[key] = saved[key]!;
      }
    }
  } catch {
    // File belum ada — return defaults
  }

  return result;
}

// ─── Write ───────────────────────────────────────────────────────────────────

export async function updateHomepageImage(key: ImageKey, url: string): Promise<void> {
  const current = await getHomepageImages();
  current[key] = url;

  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(current, null, 2), "utf-8");
}

export async function resetHomepageImage(key: ImageKey): Promise<void> {
  const current = await getHomepageImages();
  current[key] = DEFAULT_IMAGES[key];

  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(current, null, 2), "utf-8");
}
