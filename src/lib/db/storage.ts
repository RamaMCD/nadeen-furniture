/**
 * Supabase Storage helpers for the `product-images` bucket.
 *
 * All storage interactions for product images are centralised here.
 * Bucket name, path format, and public URL construction are single-sourced
 * so callers never need to know implementation details.
 */

import { createClient } from "@/lib/supabase/client";

const BUCKET = "product-images";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface UploadResult {
  /** Fully-qualified public URL ready to store in products.image_url. */
  publicUrl: string;
  /** Storage path (relative to bucket root) — keep this for deletion. */
  path: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Derive the storage path from a public URL.
 * Used when deleting an image whose URL is the only thing we have.
 */
export function pathFromUrl(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl);
    // Supabase public URLs follow the pattern:
    //   /storage/v1/object/public/{bucket}/{path}
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const idx = url.pathname.indexOf(marker);
    if (idx === -1) return null;
    return url.pathname.slice(idx + marker.length);
  } catch {
    return null;
  }
}

// ─── Upload ─────────────────────────────────────────────────────────────────

/**
 * Upload a product image to Supabase Storage.
 *
 * Files are scoped per product: `{productId}/{timestamp}.{ext}`
 * The timestamp prevents cache collision when replacing images.
 *
 * @param file        The File object from an <input type="file">.
 * @param productId   The product UUID — used as the folder name.
 */
export async function uploadProductImage(
  file: File,
  productId: string
): Promise<UploadResult> {
  const supabase = createClient();

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeExt = ["jpg", "jpeg", "png", "webp", "avif"].includes(ext) ? ext : "jpg";
  const uid =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  const path = `${productId}/${Date.now()}-${uid}.${safeExt}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) throw new Error(`Image upload failed: ${error.message}`);

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { publicUrl, path };
}

// ─── Delete ─────────────────────────────────────────────────────────────────

/**
 * Delete a product image from Supabase Storage by its public URL.
 * Silently succeeds if the path cannot be derived (non-fatal).
 */
export async function deleteProductImageByUrl(
  publicUrl: string
): Promise<void> {
  const path = pathFromUrl(publicUrl);
  if (!path) return; // Not a Supabase Storage URL — skip

  const supabase = createClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    // Log but don't throw — image cleanup is non-critical
    console.warn("[storage] Failed to delete image:", error.message);
  }
}

/**
 * Delete all images for a product folder (by productId).
 * Called when a product is permanently deleted.
 */
export async function deleteProductImages(productId: string): Promise<void> {
  const supabase = createClient();

  // List all objects under the product's folder
  const { data: objects, error: listError } = await supabase.storage
    .from(BUCKET)
    .list(productId);

  if (listError || !objects?.length) return;

  const paths = objects.map((obj) => `${productId}/${obj.name}`);

  const { error: removeError } = await supabase.storage
    .from(BUCKET)
    .remove(paths);

  if (removeError) {
    console.warn("[storage] Failed to delete product folder:", removeError.message);
  }
}
