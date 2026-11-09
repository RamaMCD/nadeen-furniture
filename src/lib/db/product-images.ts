/**
 * Product images (gallery) data-access layer — admin/browser client.
 * Backward-compatible with `products.image_url` (denormalized primary/legacy).
 */

import { createClient } from "@/lib/supabase/client";
import type { ProductImage } from "@/types/database";
import { uploadProductImage, deleteProductImageByUrl, pathFromUrl } from "@/lib/db/storage";

export type { ProductImage };

function throwIf(error: { message: string } | null): asserts error is null {
  if (error) throw new Error(error.message);
}

async function syncPrimaryToProduct(productId: string, imageUrl: string | null) {
  const supabase = createClient();
  const { error } = await supabase
    .from("products")
    .update({ image_url: imageUrl } as never)
    .eq("id", productId);
  if (error) console.warn("[product-images] failed to sync products.image_url:", error.message);
}

export async function listProductImages(productId: string): Promise<ProductImage[]> {
  const supabase = createClient();
  const { data, error } = (await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("is_primary", { ascending: false })
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true })) as unknown as {
    data: ProductImage[] | null;
    error: { message: string } | null;
  };
  throwIf(error);
  return data ?? [];
}

export async function addProductImage(input: {
  productId: string;
  file: File;
  altText?: string;
  makePrimary?: boolean;
}): Promise<ProductImage> {
  const supabase = createClient();
  const existing = await listProductImages(input.productId);
  const makePrimary = input.makePrimary ?? (existing.length === 0 || !existing.some((i) => i.is_primary));
  const displayOrder =
    existing.length === 0 ? 0 : Math.max(...existing.map((i) => i.display_order)) + 1;

  const { publicUrl, path } = await uploadProductImage(input.file, input.productId);

  if (makePrimary) {
    await supabase
      .from("product_images")
      .update({ is_primary: false } as never)
      .eq("product_id", input.productId)
      .eq("is_primary", true);
  }

  const { data, error } = (await supabase
    .from("product_images")
    .insert({
      product_id: input.productId,
      image_url: publicUrl,
      storage_path: path,
      alt_text: (input.altText ?? "").trim(),
      display_order: displayOrder,
      is_primary: makePrimary,
    } as never)
    .select("*")
    .single()) as unknown as { data: ProductImage; error: { message: string } | null };

  if (error) {
    await deleteProductImageByUrl(publicUrl);
    throw new Error(error.message);
  }

  if (makePrimary) await syncPrimaryToProduct(input.productId, publicUrl);
  return data;
}

export async function setPrimaryProductImage(productId: string, imageId: string): Promise<void> {
  const supabase = createClient();
  const images = await listProductImages(productId);
  const target = images.find((i) => i.id === imageId);
  if (!target) throw new Error("Image not found.");

  const { error: clearError } = await supabase
    .from("product_images")
    .update({ is_primary: false } as never)
    .eq("product_id", productId)
    .neq("id", imageId);
  throwIf(clearError as { message: string } | null);

  const { error } = await supabase
    .from("product_images")
    .update({ is_primary: true } as never)
    .eq("id", imageId);
  throwIf(error as { message: string } | null);

  await syncPrimaryToProduct(productId, target.image_url);
}

export async function updateProductImage(input: {
  productId: string;
  imageId: string;
  altText?: string;
  displayOrder?: number;
  file?: File | null;
}): Promise<ProductImage> {
  const supabase = createClient();
  const images = await listProductImages(input.productId);
  const existing = images.find((i) => i.id === input.imageId);
  if (!existing) throw new Error("Image not found.");

  const updates: Record<string, unknown> = {};
  if (input.altText !== undefined) updates.alt_text = input.altText.trim();
  if (input.displayOrder !== undefined) updates.display_order = input.displayOrder;

  let oldToCleanup: { image_url: string; storage_path: string | null } | null = null;
  if (input.file) {
    const uploaded = await uploadProductImage(input.file, input.productId);
    updates.image_url = uploaded.publicUrl;
    updates.storage_path = uploaded.path;
    oldToCleanup = { image_url: existing.image_url, storage_path: existing.storage_path };
  }

  const { data, error } = (await supabase
    .from("product_images")
    .update(updates as never)
    .eq("id", input.imageId)
    .select("*")
    .single()) as unknown as { data: ProductImage; error: { message: string } | null };

  if (error) {
    if (updates.image_url) await deleteProductImageByUrl(String(updates.image_url));
    throw new Error(error.message);
  }

  if (oldToCleanup) {
    await safeDeleteStorageIfUnreferenced(input.productId, oldToCleanup.image_url, oldToCleanup.storage_path, input.imageId);
    if (data.is_primary) await syncPrimaryToProduct(input.productId, data.image_url);
  }

  return data;
}

async function safeDeleteStorageIfUnreferenced(
  productId: string,
  imageUrl: string,
  storagePath: string | null,
  excludeImageId?: string
) {
  const supabase = createClient();

  let byUrl = supabase
    .from("product_images")
    .select("id")
    .eq("product_id", productId)
    .eq("image_url", imageUrl);
  if (excludeImageId) byUrl = byUrl.neq("id", excludeImageId);
  const { data: urlRefs } = (await byUrl) as unknown as { data: Array<{ id: string }> | null };
  if (urlRefs && urlRefs.length > 0) return;

  if (storagePath) {
    let byPath = supabase
      .from("product_images")
      .select("id")
      .eq("product_id", productId)
      .eq("storage_path", storagePath);
    if (excludeImageId) byPath = byPath.neq("id", excludeImageId);
    const { data: pathRefs } = (await byPath) as unknown as { data: Array<{ id: string }> | null };
    if (pathRefs && pathRefs.length > 0) return;
  }

  const path = storagePath ?? pathFromUrl(imageUrl);
  if (path) {
    const { error } = await supabase.storage.from("product-images").remove([path]);
    if (error) console.warn("[product-images] storage cleanup failed:", error.message);
  } else {
    await deleteProductImageByUrl(imageUrl);
  }
}

export async function deleteProductImage(productId: string, imageId: string): Promise<void> {
  const supabase = createClient();
  const images = await listProductImages(productId);
  const target = images.find((i) => i.id === imageId);
  if (!target) return;

  const { error } = await supabase.from("product_images").delete().eq("id", imageId);
  throwIf(error as { message: string } | null);

  await safeDeleteStorageIfUnreferenced(productId, target.image_url, target.storage_path, imageId);

  if (target.is_primary) {
    const remaining = images.filter((i) => i.id !== imageId).sort((a, b) => a.display_order - b.display_order || a.created_at.localeCompare(b.created_at));
    if (remaining[0]) {
      await setPrimaryProductImage(productId, remaining[0].id);
    } else {
      await syncPrimaryToProduct(productId, null);
    }
  }
}

export async function reorderProductImages(productId: string, orderedIds: string[]): Promise<void> {
  const supabase = createClient();
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("product_images").update({ display_order: index } as never).eq("id", id).eq("product_id", productId)
    )
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message);
}

export function resolveProductImages(
  gallery: Array<Pick<ProductImage, "id" | "image_url" | "alt_text" | "display_order" | "is_primary">>,
  legacyImageUrl?: string | null,
  productName?: string
): Array<Pick<ProductImage, "id" | "image_url" | "alt_text" | "display_order" | "is_primary">> {
  if (gallery.length > 0) return gallery;
  if (legacyImageUrl) {
    return [{
      id: "legacy",
      image_url: legacyImageUrl,
      alt_text: productName ?? "",
      display_order: 0,
      is_primary: true,
    }];
  }
  return [];
}
