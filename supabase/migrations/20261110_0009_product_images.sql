/*
# Product images gallery (multi-image per product)

Backward-compatible extension: keeps `products.image_url` as denormalized
primary/legacy image for existing list/card flows, and adds `product_images`
for the full gallery (admin-managed, public-readable for published products).

## Table: public.product_images
- id            uuid PK
- product_id    uuid NOT NULL FK -> products(id) ON DELETE CASCADE
- image_url     text NOT NULL
- storage_path  text NULL (bucket-relative path in `product-images` for cleanup)
- alt_text      text NOT NULL DEFAULT ''
- display_order integer NOT NULL DEFAULT 0
- is_primary    boolean NOT NULL DEFAULT false
- created_at    timestamptz NOT NULL DEFAULT now()

## Safety
- Backfills one primary row from existing `products.image_url` where present.
- RLS: anon can SELECT images only for published products; authenticated has
  full CRUD/select.
- Reuses existing `product-images` storage bucket/policies (migration 0002).
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

-- At most one primary image per product (application also enforces this).
CREATE UNIQUE INDEX IF NOT EXISTS product_images_one_primary_per_product_idx
  ON public.product_images (product_id)
  WHERE is_primary = true;

-- Backfill legacy single image into gallery (idempotent).
INSERT INTO public.product_images (product_id, image_url, storage_path, alt_text, display_order, is_primary)
SELECT
  p.id,
  p.image_url,
  NULL,
  0,
  true
FROM public.products p
WHERE p.image_url IS NOT NULL
  AND btrim(p.image_url) <> ''
  AND NOT EXISTS (
    SELECT 1 FROM public.product_images pi WHERE pi.product_id = p.id
  );

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

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

NOTIFY pgrst, 'reload schema';
