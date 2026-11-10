"use client";

import * as React from "react";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Loader2,
  RefreshCcw,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/lib/db/product-images";
import {
  addProductImage,
  deleteProductImage,
  listProductImages,
  reorderProductImages,
  setPrimaryProductImage,
  updateProductImage,
} from "@/lib/db/product-images";
import { formatBytes, optimizeImageForUpload } from "@/lib/images/optimize";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProductImagesManagerProps {
  productId: string;
  className?: string;
  onPrimaryChange?: (imageUrl: string | null) => void;
}

type UploadPhase = "optimizing" | "uploading";

export function ProductImagesManager({ productId, className, onPrimaryChange }: ProductImagesManagerProps) {
  const [images, setImages] = React.useState<ProductImage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploadStatus, setUploadStatus] = React.useState<string | null>(null);
  const uploadRef = React.useRef<HTMLInputElement>(null);
  const replaceRefs = React.useRef<Record<string, HTMLInputElement | null>>({});

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listProductImages(productId);
      const sorted = [...data].sort((a, b) => {
        const ao = a.display_order ?? 0;
        const bo = b.display_order ?? 0;
        if (ao !== bo) return ao - bo;
        return a.created_at.localeCompare(b.created_at);
      });
      setImages(sorted);
      onPrimaryChange?.(sorted.find((i) => i.is_primary)?.image_url ?? sorted[0]?.image_url ?? null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load images.";
      if (msg.includes("schema cache") || msg.includes("product_images")) {
        toast.error("Product gallery not ready. Apply migration 20261110_0010_fix_product_images_gallery.sql in Supabase.");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [productId, onPrimaryChange]);

  React.useEffect(() => {
    void load();
  }, [load]);

  function describePhase(phase: UploadPhase, index: number, total: number, name: string, extra?: string) {
    const prefix = total > 1 ? `[${index + 1}/${total}] ` : "";
    const label = phase === "optimizing" ? "Optimizing" : "Uploading";
    return `${prefix}${label} ${name}${extra ? ` — ${extra}` : ""}`;
  }

  async function prepareFile(file: File, index: number, total: number): Promise<File> {
    if (!file.type.startsWith("image/")) {
      throw new Error("File bukan gambar yang didukung.");
    }
    setUploadStatus(describePhase("optimizing", index, total, file.name, formatBytes(file.size)));
    const optimized = await optimizeImageForUpload(file);
    if (optimized.wasOptimized || optimized.optimizedSize !== optimized.originalSize) {
      setUploadStatus(
        describePhase(
          "uploading",
          index,
          total,
          optimized.file.name,
          `${formatBytes(optimized.originalSize)} → ${formatBytes(optimized.optimizedSize)}`
        )
      );
    } else {
      setUploadStatus(describePhase("uploading", index, total, file.name, formatBytes(file.size)));
    }
    return optimized.file;
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    setUploading(true);
    let success = 0;
    const failures: string[] = [];
    let hasPrimary = images.some((i) => i.is_primary);

    try {
      for (const [index, file] of list.entries()) {
        try {
          const uploadFile = await prepareFile(file, index, list.length);
          await addProductImage({ productId, file: uploadFile, makePrimary: !hasPrimary });
          success += 1;
          hasPrimary = true;
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Unknown error";
          failures.push(`Image ${index + 1} (${file.name}): ${msg}`);
        }
      }

      if (success > 0 && failures.length === 0) {
        toast.success(success > 1 ? `${success} images uploaded.` : "Image uploaded.");
      } else if (success > 0 && failures.length > 0) {
        toast.error(`Uploaded ${success}/${list.length} images. ${failures[0]}`);
        if (failures.length > 1) console.warn("[product-images] Upload failures:", failures);
      } else if (failures.length > 0) {
        const first = failures[0];
        if (first.includes("schema cache") || first.includes("product_images")) {
          toast.error(
            "Product gallery not ready. Apply migration 20261110_0010_fix_product_images_gallery.sql in Supabase, then reload the PostgREST schema cache."
          );
        } else if (first.toLowerCase().includes("maximum allowed size") || first.toLowerCase().includes("exceeded")) {
          toast.error(
            `Upload failed: ${first}. Coba kompres ulang gambar atau jalankan migration 20261110_0011_product_images_bucket_limits.sql di Supabase.`
          );
        } else {
          toast.error(`Upload failed: ${first}`);
        }
      }
    } finally {
      await load();
      setUploading(false);
      setUploadStatus(null);
      if (uploadRef.current) uploadRef.current.value = "";
    }
  }

  async function handleSetPrimary(imageId: string) {
    setBusyId(imageId);
    try {
      await setPrimaryProductImage(productId, imageId);
      await load();
      toast.success("Primary image updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to set primary image.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(imageId: string) {
    if (!window.confirm("Remove this image?")) return;
    setBusyId(imageId);
    try {
      await deleteProductImage(productId, imageId);
      await load();
      toast.success("Image removed.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove image.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleReplace(imageId: string, file: File | null) {
    if (!file) return;
    setBusyId(imageId);
    try {
      setUploadStatus(describePhase("optimizing", 0, 1, file.name, formatBytes(file.size)));
      const optimized = await optimizeImageForUpload(file);
      setUploadStatus(
        describePhase(
          "uploading",
          0,
          1,
          optimized.file.name,
          optimized.wasOptimized || optimized.optimizedSize !== optimized.originalSize
            ? `${formatBytes(optimized.originalSize)} → ${formatBytes(optimized.optimizedSize)}`
            : formatBytes(optimized.optimizedSize)
        )
      );
      await updateProductImage({ productId, imageId, file: optimized.file });
      await load();
      toast.success("Image replaced.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to replace image.";
      if (msg.toLowerCase().includes("maximum allowed size") || msg.toLowerCase().includes("exceeded")) {
        toast.error(`${msg}. Coba jalankan migration 20261110_0011_product_images_bucket_limits.sql di Supabase.`);
      } else {
        toast.error(msg);
      }
    } finally {
      setBusyId(null);
      setUploadStatus(null);
      const ref = replaceRefs.current[imageId];
      if (ref) ref.value = "";
    }
  }

  async function move(imageId: string, direction: -1 | 1) {
    const idx = images.findIndex((i) => i.id === imageId);
    if (idx < 0) return;
    const swap = idx + direction;
    if (swap < 0 || swap >= images.length) return;
    const next = [...images];
    const [item] = next.splice(idx, 1);
    next.splice(swap, 0, item);
    setImages(next);
    setBusyId(imageId);
    try {
      await reorderProductImages(productId, next.map((i) => i.id));
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reorder images.");
      await load();
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2 py-6 text-sm text-muted-foreground", className)}>
        <Loader2 className="h-4 w-4 animate-spin" /> Loading images...
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{images.length} image{images.length === 1 ? "" : "s"}</p>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => uploadRef.current?.click()} disabled={uploading || busyId !== null}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            {uploading ? "Processing..." : "Add Images"}
          </Button>
          <input
            ref={uploadRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            className="hidden"
            onChange={(e) => void handleUpload(e.target.files)}
          />
        </div>
      </div>

      {uploadStatus && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span className="truncate">{uploadStatus}</span>
        </div>
      )}

      {images.length === 0 ? (
        <button
          type="button"
          onClick={() => uploadRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-10 text-center transition-colors hover:border-primary/40 hover:bg-muted/20"
        >
          <ImagePlus className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm font-medium">Upload product images</span>
          <span className="text-xs text-muted-foreground">JPG, PNG, WebP, AVIF · multiple files supported · auto-optimized before upload</span>
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((img, idx) => {
            const isBusy = busyId === img.id;
            return (
              <div key={img.id} className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="relative aspect-[4/3] bg-[#FAF8F4]">
                  <Image src={img.image_url} alt={img.alt_text || "Product image"} fill className="object-contain p-2" sizes="200px" unoptimized={img.image_url.startsWith("blob:")} />
                  {img.is_primary && (
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-[#C5A46D] px-2 py-0.5 text-[10px] font-semibold text-white">Primary</span>
                  )}
                  {isBusy && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div className="space-y-2 p-2">
                  <Input
                    defaultValue={img.alt_text}
                    placeholder="Alt text"
                    className="h-8 text-xs"
                    onBlur={(e) => {
                      const v = e.target.value;
                      if (v !== (img.alt_text ?? "")) {
                        void updateProductImage({ productId, imageId: img.id, altText: v }).catch(() => {});
                      }
                    }}
                  />
                  <div className="flex flex-wrap items-center gap-1">
                    <Button type="button" variant={img.is_primary ? "default" : "outline"} size="sm" className="h-7 px-2 text-[11px]" disabled={isBusy || img.is_primary} onClick={() => void handleSetPrimary(img.id)} title="Set as primary">
                      <Star className="h-3 w-3" /> Primary
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7" disabled={isBusy || idx === 0} onClick={() => void move(img.id, -1)} aria-label="Move up">
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7" disabled={isBusy || idx === images.length - 1} onClick={() => void move(img.id, 1)} aria-label="Move down">
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7" disabled={isBusy} onClick={() => replaceRefs.current[img.id]?.click()} aria-label="Replace image" title="Replace image">
                      <RefreshCcw className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" disabled={isBusy} onClick={() => void handleDelete(img.id)} aria-label="Remove image">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <input
                      ref={(el) => { replaceRefs.current[img.id] = el; }}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="hidden"
                      onChange={(e) => void handleReplace(img.id, e.target.files?.[0] ?? null)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
