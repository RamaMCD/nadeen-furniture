/*
# Fix: product gallery table, backfill, RLS, and PostgREST schema cache

Root-cause repair for:
  "Could not find the table 'public.product_images' in the schema cache"

This migration is safe to run multiple times and safe when 0009 was partially
applied or failed during backfill.

- Creates `public.product_images` if missing (structure aligned with products.id = uuid).
- Adds indexes and one-primary-per-product constraint if missing.
- Backfills legacy `products.image_url` rows idempotently (correct column mapping).
- Ensures RLS/policies: public can read images for published products only;
  authenticated can manage gallery rows.
- Reuses existing `product-images` storage bucket/policies from migration 0002.
- Reloads PostgREST schema cache so the Supabase API can access the table.

No existing product or image data is deleted.
*/

CREATE TABLE IF NOT EXISTS public.product_images (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url     text NOT NULL,
  storage_path  text,
  alt_text      text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  is_primary    boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.product_images IS
  'Gallery images for products. `products.image_url` remains the denormalized primary/legacy image for backward compatibility.';

CREATE INDEX IF NOT EXISTS product_images_product_id_order_idx
  ON public.product_images (product_id, display_order ASC, created_at ASC);

-- At most one primary image per product.
CREATE UNIQUE INDEX IF NOT EXISTS product_images_one_primary_per_product_idx
  ON public.product_images (product_id)
  WHERE is_primary = true;

-- Backfill legacy single image into gallery (idempotent, correct mapping).
INSERT INTO public.product_images (product_id, image_url, storage_path, alt_text, display_order, is_primary)
SELECT
  p.id,
  btrim(p.image_url),
  NULL,
  COALESCE(NULLIF(btrim(p.name), ''), ''),
  0,
  true
FROM public.products p
WHERE p.image_url IS NOT NULL
  AND btrim(p.image_url) <> ''
  AND NOT EXISTS (
    SELECT 1 FROM public.product_images pi WHERE pi.product_id = p.id
  );

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Public (anon) may read gallery rows only for published products.
DROP POLICY IF EXISTS "anon_select_published_product_images" ON public.product_images;
CREATE POLICY "anon_select_published_product_images"
  ON public.product_images
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1
      FROM public.products p
      WHERE p.id = product_images.product_id
        AND p.is_published = true
    )
  );

-- Authenticated admins can fully manage gallery rows.
DROP POLICY IF EXISTS "authenticated_select_product_images" ON public.product_images;
CREATE POLICY "authenticated_select_product_images"
  ON public.product_images FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "authenticated_insert_product_images" ON public.product_images;
CREATE POLICY "authenticated_insert_product_images"
  ON public.product_images FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_product_images" ON public.product_images;
CREATE POLICY "authenticated_update_product_images"
  ON public.product_images FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_product_images" ON public.product_images;
CREATE POLICY "authenticated_delete_product_images"
  ON public.product_images FOR DELETE TO authenticated
  USING (true);

-- Ensure PostgREST picks up the table immediately after migration.
NOTIFY pgrst, 'reload schema';
