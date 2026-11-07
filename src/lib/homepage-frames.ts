/**
 * Aspek rasio frame gambar homepage.
 * Semua slot memakai salah satu dari dua rasio tetap:
 *   - "16/9" → landscape
 *   - "4/5"  → portrait
 *
 * Dipakai bersama oleh halaman publik dan preview Admin,
 * supaya crop di admin = yang tampil di homepage.
 */

import type { ImageKey } from "@/lib/db/homepage-images";

export type FrameAspect = "16/9" | "4/5";

export const IMAGE_FRAME_ASPECTS: Record<ImageKey, FrameAspect> = {
  /** Hero background — full-bleed; panduan crop 16:9 */
  hero: "16/9",
  /** Foto produk di hero */
  heroProduct: "4/5",
  /** Intro — foto besar atas */
  introMain: "16/9",
  /** Intro — pasangan bawah */
  introLeft: "4/5",
  introRight: "4/5",
  /** Homepage — About Us portrait frame */
  aboutUs: "4/5",
  /** Process — foto material besar */
  processMaterial: "4/5",
  /** Process — pasangan bawah */
  processLeft: "4/5",
  processCenter: "4/5",
  processRight: "4/5",
  /** Galeri material — tiga foto portrait */
  materialGallery1: "4/5",
  materialGallery2: "4/5",
  materialGallery3: "4/5",
  /** Catalog CTA — featured product */
  catalogFeature: "4/5",
  catalogFeature2: "4/5",
  catalogFeature3: "4/5",
  catalogFeature4: "4/5",
  catalogFeatureLandscape: "16/9",
  catalogFeature5: "4/5",
  catalogFeature6: "4/5",
  /** Stats — foto utama */
  statsMain: "16/9",
};

/** Label singkat untuk badge admin */
export const FRAME_ASPECT_LABEL: Record<FrameAspect, string> = {
  "16/9": "16:9 Landscape",
  "4/5": "4:5 Portrait",
};

/** Class Tailwind untuk container frame */
export function frameAspectClass(aspect: FrameAspect): string {
  return aspect === "16/9" ? "aspect-video" : "aspect-[4/5]";
}

/**
 * Lebar grup frame di homepage.
 * Lebih sempit dari container teks (max-w-6xl) supaya tidak memenuhi layar,
 * rasio 4:5 / 16:9 tetap.
 */
export const FRAME_GROUP_CLASS = "w-full max-w-4xl mx-auto";
