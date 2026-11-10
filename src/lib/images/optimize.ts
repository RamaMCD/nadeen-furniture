/**
 * Client-side image optimization for product uploads.
 *
 * - Resizes large images (max long edge) without upscaling.
 * - Compresses to a catalog-friendly size while preserving visual quality.
 * - Prefers WebP for JPEG/opaque images; preserves transparency for PNG when needed.
 * - Preserves camera orientation when the browser supports EXIF-aware decoding.
 *
 * Runs in the browser (Canvas / createImageBitmap). Safe to import from client code only.
 */

export interface OptimizeOptions {
  /** Max width/height for the longest edge (no upscaling). */
  maxDimension?: number;
  /** Target output size in bytes (best-effort). */
  targetBytes?: number;
  /** Hard upper bound after optimization (best-effort). */
  maxBytes?: number;
}

export interface OptimizeResult {
  file: File;
  originalFile: File;
  originalSize: number;
  optimizedSize: number;
  wasOptimized: boolean;
  width: number;
  height: number;
  format: "image/webp" | "image/jpeg" | "image/png";
}

const DEFAULTS: Required<OptimizeOptions> = {
  maxDimension: 2400,
  targetBytes: 1_200_000, // ~1.2 MB target for furniture detail
  maxBytes: 3_500_000, // keep comfortably under typical bucket limits after optimization
};

const SMALL_ENOUGH_BYTES = 450_000; // don't over-compress already small files

function formatExt(mime: OptimizeResult["format"]): string {
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpg";
  return "webp";
}

function replaceExtension(name: string, ext: string): string {
  const base = name.replace(/\.[^.]+$/, "");
  return `${base}.${ext}`;
}

function clampQuality(q: number) {
  return Math.min(0.95, Math.max(0.5, q));
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      // Preserve EXIF orientation from camera photos when supported.
      return await createImageBitmap(file, { imageOrientation: "from-image" } as ImageBitmapOptions);
    } catch {
      return await createImageBitmap(file);
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Failed to decode image."));
      el.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function getDimensions(source: ImageBitmap | HTMLImageElement): { width: number; height: number } {
  if ("close" in source) return { width: source.width, height: source.height };
  return { width: source.naturalWidth || source.width, height: source.naturalHeight || source.height };
}

function computeSize(width: number, height: number, maxDimension: number) {
  const longest = Math.max(width, height);
  if (longest <= maxDimension || maxDimension <= 0) {
    return { width, height, scaled: false };
  }
  const scale = maxDimension / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
    scaled: true,
  };
}

function hasAlpha(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  try {
    const w = Math.min(width, 256);
    const h = Math.min(height, 256);
    if (w <= 0 || h <= 0) return false;
    const sample = ctx.getImageData(0, 0, w, h).data;
    for (let i = 3; i < sample.length; i += 16) {
      if (sample[i] < 255) return true;
    }
    // sparse wider check
    for (let i = 3; i < sample.length; i += 4) {
      if (sample[i] < 255) return true;
    }
    return false;
  } catch {
    // If pixels can't be read, assume alpha to be safe for PNGs.
    return true;
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to encode image."));
      },
      type,
      quality
    );
  });
}

function pickOutputFormat(inputType: string, alpha: boolean): OptimizeResult["format"] {
  const t = (inputType || "").toLowerCase();
  // Preserve transparency: prefer WebP (alpha-capable, widely supported) for smaller size.
  if (alpha) return "image/webp";
  if (t.includes("png")) return "image/webp";
  if (t.includes("webp")) return "image/webp";
  if (t.includes("jpeg") || t.includes("jpg")) return "image/webp";
  // AVIF/others: convert to WebP for broad compatibility in storage + app flow.
  return "image/webp";
}

async function encodeWithinTarget(
  canvas: HTMLCanvasElement,
  format: OptimizeResult["format"],
  opts: Required<OptimizeOptions>
): Promise<Blob> {
  if (format === "image/png") {
    // PNG is lossless in canvas; size mainly driven by dimensions.
    return canvasToBlob(canvas, "image/png");
  }

  const qualities = [0.9, 0.84, 0.78, 0.72, 0.66, 0.6, 0.54];
  let best: Blob | null = null;

  for (const qRaw of qualities) {
    const q = clampQuality(qRaw);
    const blob = await canvasToBlob(canvas, format, q);
    best = blob;
    if (blob.size <= opts.targetBytes) return blob;
  }

  // If still too large, try one stronger pass for JPEG/WebP.
  if (best && best.size > opts.maxBytes && format === "image/webp") {
    const jpegFallback = await canvasToBlob(canvas, "image/jpeg", 0.7);
    if (jpegFallback.size < best.size) return jpegFallback;
  }

  return best as Blob;
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / Math.pow(1024, i);
  return `${value >= 10 || i === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[i]}`;
}

export function isSupportedImageFile(file: File): boolean {
  const t = (file.type || "").toLowerCase();
  return ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"].includes(t);
}

/**
 * Optimize an image file before upload. Falls back to the original file on decode/encode failure
 * so the caller can still attempt an upload and surface a clear error.
 */
export async function optimizeImageForUpload(
  file: File,
  options: OptimizeOptions = {}
): Promise<OptimizeResult> {
  const opts = { ...DEFAULTS, ...options };
  const originalSize = file.size;

  if (!file.type.startsWith("image/")) {
    throw new Error("File bukan gambar yang valid.");
  }

  let bitmap: ImageBitmap | HTMLImageElement;
  try {
    bitmap = await loadBitmap(file);
  } catch {
    // Can't optimize; return original so upload can report a meaningful error if any.
    return {
      file,
      originalFile: file,
      originalSize,
      optimizedSize: originalSize,
      wasOptimized: false,
      width: 0,
      height: 0,
      format: (file.type as OptimizeResult["format"]) || "image/jpeg",
    };
  }

  try {
    const { width: srcW, height: srcH } = getDimensions(bitmap);
    const target = computeSize(srcW, srcH, opts.maxDimension);

    const canvas = document.createElement("canvas");
    canvas.width = target.width;
    canvas.height = target.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");

    // Draw first to detect alpha (important for PNG transparency).
    ctx.drawImage(bitmap as CanvasImageSource, 0, 0, target.width, target.height);

    const alpha = (file.type || "").toLowerCase().includes("png") ? hasAlpha(ctx, target.width, target.height) : false;
    let format = pickOutputFormat(file.type, alpha);

    // If PNG with transparency, WebP keeps alpha and is efficient; ensure white bg not applied.
    if (alpha) {
      // redraw already done with transparency preserved
      format = "image/webp";
    }

    const shouldSkip =
      !target.scaled &&
      originalSize > 0 &&
      originalSize <= SMALL_ENOUGH_BYTES &&
      ((file.type === "image/webp" && format === "image/webp") ||
        (file.type === "image/jpeg" && format === "image/webp" ? false : file.type === format));

    if (shouldSkip) {
      return {
        file,
        originalFile: file,
        originalSize,
        optimizedSize: originalSize,
        wasOptimized: false,
        width: srcW,
        height: srcH,
        format: (file.type as OptimizeResult["format"]) || "image/webp",
      };
    }

    let blob = await encodeWithinTarget(canvas, format, opts);

    // If optimization somehow produced a larger file for an already-small image, keep original.
    if (!target.scaled && blob.size >= originalSize * 0.98 && originalSize <= opts.targetBytes) {
      return {
        file,
        originalFile: file,
        originalSize,
        optimizedSize: originalSize,
        wasOptimized: false,
        width: srcW,
        height: srcH,
        format: (file.type as OptimizeResult["format"]) || "image/webp",
      };
    }

    // Best-effort hard cap: if still above maxBytes, reduce dimensions progressively.
    if (blob.size > opts.maxBytes) {
      let w = target.width;
      let h = target.height;
      for (let i = 0; i < 3 && blob.size > opts.maxBytes; i++) {
        w = Math.max(1, Math.round(w * 0.85));
        h = Math.max(1, Math.round(h * 0.85));
        canvas.width = w;
        canvas.height = h;
        const ctx2 = canvas.getContext("2d");
        if (!ctx2) break;
        ctx2.drawImage(bitmap as CanvasImageSource, 0, 0, w, h);
        blob = await encodeWithinTarget(canvas, format, { ...opts, targetBytes: Math.min(opts.targetBytes, opts.maxBytes) });
      }
    }

    const ext = formatExt(format);
    const outName = replaceExtension(file.name || `image.${ext}`, ext);
    const outFile = new File([blob], outName, { type: format, lastModified: Date.now() });

    return {
      file: outFile,
      originalFile: file,
      originalSize,
      optimizedSize: outFile.size,
      wasOptimized: outFile.size !== originalSize || target.scaled || outFile.type !== file.type || outFile.name !== file.name,
      width: canvas.width,
      height: canvas.height,
      format,
    };
  } finally {
    if ("close" in bitmap) {
      try {
        bitmap.close();
      } catch {
        // ignore
      }
    }
  }
}
