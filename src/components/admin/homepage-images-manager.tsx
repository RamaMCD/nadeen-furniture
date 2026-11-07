"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, RotateCcw, Check, Loader2, ImageIcon } from "lucide-react";
import type { ImageKey } from "@/lib/db/homepage-images";
import { DEFAULT_IMAGES } from "@/lib/site-config";
import {
  IMAGE_FRAME_ASPECTS,
  FRAME_ASPECT_LABEL,
  frameAspectClass,
} from "@/lib/homepage-frames";
import { uploadHomepageImageAction, resetHomepageImageAction } from "@/lib/actions/homepage-images";

const IMAGE_SLOTS: { key: ImageKey; label: string; description: string }[] = [
  { key: "hero",            label: "Hero — Background",        description: "Gambar background utama halaman hero" },
  { key: "heroProduct",     label: "Hero — Foto Produk",       description: "Foto produk portrait di area hero" },
  { key: "introMain",       label: "Intro — Foto Atas",        description: "Foto besar section Uniqueness & Quality" },
  { key: "introLeft",       label: "Intro — Foto Kiri",        description: "Foto kiri di grid bawah section intro" },
  { key: "introRight",      label: "Intro — Foto Kanan",       description: "Foto kanan di grid bawah (ada caption overlay)" },
  { key: "aboutUs",         label: "About Us — Foto",          description: "Frame portrait 4:5 di section About Us homepage" },
  { key: "processMaterial", label: "Process — Foto Material",  description: "Foto besar material di section Kenali Produk" },
  { key: "processLeft",     label: "Process — Foto Kiri",      description: "Foto kiri grid bawah section process" },
  { key: "processCenter",  label: "Process — Foto Tengah",    description: "Foto tengah tangga frame bawah section process" },
  { key: "processRight",    label: "Process — Foto Kanan",     description: "Foto kanan grid bawah section process" },
  { key: "materialGallery1", label: "Galeri Material — Foto 1", description: "Frame portrait 4:5 sebelum section Kenali Produk" },
  { key: "materialGallery2", label: "Galeri Material — Foto 2", description: "Frame portrait 4:5 sebelum section Kenali Produk" },
  { key: "materialGallery3", label: "Galeri Material — Foto 3", description: "Frame portrait 4:5 sebelum section Kenali Produk" },
  { key: "catalogFeature",  label: "Catalog CTA — Featured",   description: "Foto featured product di section Lihat Lebih Dekat" },
  { key: "catalogFeature2", label: "Catalog CTA — Foto 2",      description: "Frame kedua galeri Lihat Lebih Dekat" },
  { key: "catalogFeature3", label: "Catalog CTA — Foto 3",      description: "Frame ketiga galeri Lihat Lebih Dekat" },
  { key: "catalogFeature4", label: "Catalog CTA — Foto 4",      description: "Frame keempat galeri Lihat Lebih Dekat" },
  { key: "catalogFeatureLandscape", label: "Catalog CTA — Landscape", description: "Frame landscape 16:9 galeri Lihat Lebih Dekat" },
  { key: "catalogFeature5", label: "Catalog CTA — Portrait 5",  description: "Frame portrait 4:5 galeri Lihat Lebih Dekat" },
  { key: "catalogFeature6", label: "Catalog CTA — Portrait 6",  description: "Frame portrait 4:5 galeri Lihat Lebih Dekat" },
  { key: "statsMain",       label: "Stats — Foto Utama",       description: "Foto utama di section statistik pelanggan" },
];

interface Props {
  initialImages: Record<ImageKey, string>;
}

export function HomepageImagesManager({ initialImages }: Props) {
  const [images, setImages]   = useState(initialImages);
  const [loading, setLoading] = useState<ImageKey | null>(null);
  const [saved, setSaved]     = useState<Partial<Record<ImageKey, boolean>>>({});
  const [error, setError]     = useState<Partial<Record<ImageKey, string>>>({});
  const fileRefs              = useRef<Partial<Record<ImageKey, HTMLInputElement>>>({});

  async function handleFile(key: ImageKey, file: File) {
    if (!file.type.startsWith("image/")) {
      setError(prev => ({ ...prev, [key]: "File harus berupa gambar" }));
      return;
    }

    setLoading(key);
    setError(prev => ({ ...prev, [key]: undefined }));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const { url } = await uploadHomepageImageAction(key, formData);
      setImages(prev => ({ ...prev, [key]: url }));
      setSaved(prev => ({ ...prev, [key]: true }));
      setTimeout(() => setSaved(prev => ({ ...prev, [key]: false })), 2500);
    } catch (e) {
      setError(prev => ({ ...prev, [key]: (e as Error).message }));
    } finally {
      setLoading(null);
    }
  }

  async function handleReset(key: ImageKey) {
    setLoading(key);
    try {
      await resetHomepageImageAction(key);
      setImages(prev => ({ ...prev, [key]: DEFAULT_IMAGES[key] }));
    } finally {
      setLoading(null);
    }
  }

  function handleDrop(key: ImageKey, e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(key, file);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {IMAGE_SLOTS.map(slot => {
        const currentUrl = images[slot.key];
        const isLoading  = loading === slot.key;
        const isDefault  = currentUrl === DEFAULT_IMAGES[slot.key];

        const aspect = IMAGE_FRAME_ASPECTS[slot.key];

        return (
          <div key={slot.key} className="border border-border rounded-xl overflow-hidden bg-card flex flex-col">

            {/* ── Frame gambar — rasio sama dengan homepage (4:5 / 16:9) ── */}
            <div
              className={`relative w-full bg-muted cursor-pointer group overflow-hidden ${frameAspectClass(aspect)}`}
              onClick={() => fileRefs.current[slot.key]?.click()}
              onDrop={e => handleDrop(slot.key, e)}
              onDragOver={e => e.preventDefault()}
            >
              {currentUrl ? (
                <Image
                  src={currentUrl}
                  alt={slot.label}
                  fill
                  className="object-cover object-center transition-opacity group-hover:opacity-60"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Belum ada gambar</p>
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                {isLoading ? (
                  <Loader2 className="w-7 h-7 text-white animate-spin" />
                ) : (
                  <>
                    <Upload className="w-7 h-7 text-white" />
                    <p className="text-xs text-white font-medium">Klik atau drag foto baru</p>
                  </>
                )}
              </div>

              {/* Badge status + rasio frame */}
              <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  isDefault ? "bg-black/50 text-white/70" : "bg-primary text-primary-foreground"
                }`}>
                  {isDefault ? "Default" : "Custom"}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-black/60 text-white/90">
                  {FRAME_ASPECT_LABEL[aspect]}
                </span>
              </div>

              {/* Saved indicator */}
              {saved[slot.key] && (
                <span className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </span>
              )}

              {/* Hidden file input */}
              <input
                ref={el => { if (el) fileRefs.current[slot.key] = el; }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(slot.key, file);
                  e.target.value = "";
                }}
              />
            </div>

            {/* Info & actions */}
            <div className="p-4 flex flex-col gap-2 flex-1">
              <p className="font-medium text-sm">{slot.label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{slot.description}</p>
              <p className="text-[11px] text-muted-foreground/80">
                Frame tetap {FRAME_ASPECT_LABEL[aspect]} — foto di-crop otomatis (object-cover).
              </p>

              {error[slot.key] && (
                <p className="text-xs text-destructive">{error[slot.key]}</p>
              )}

              <div className="flex items-center justify-between mt-auto pt-3">
                <button
                  onClick={() => fileRefs.current[slot.key]?.click()}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 disabled:opacity-40 transition-colors"
                >
                  {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                  {isLoading ? "Mengupload..." : "Ganti Foto"}
                </button>

                {!isDefault && (
                  <button
                    onClick={() => handleReset(slot.key)}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <RotateCcw size={11} />
                    Reset default
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
