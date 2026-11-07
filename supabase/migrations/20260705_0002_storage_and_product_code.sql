/*
# WIMS — Migration 0002: Storage Bucket + Product Code Generation

## 1. Supabase Storage Bucket
Creates the `product-images` public bucket for product photos.
RLS policies:
  - SELECT: public (anyone can read image URLs — needed for <img> tags)
  - INSERT / UPDATE / DELETE: authenticated users only

## 2. Product Code Sequence
A PostgreSQL SEQUENCE (`product_code_seq`) is the safest mechanism for
generating sequential, gap-free, race-condition-free codes without
advisory locks. Sequences are incremented atomically even under heavy
concurrent load.

## 3. `set_product_code()` Trigger Function
Fires BEFORE INSERT on `products`. If `product_code` is NULL or empty
the trigger draws the next value from `product_code_seq` and formats it
as `BRGnnnnnn` (zero-padded to 6 digits). It also sets `barcode` to
match `product_code` if barcode is not explicitly provided.

## 4. `generate_product_code()` RPC
A SECURITY DEFINER helper that the frontend can call via
`supabase.rpc('generate_product_code')` to preview the next code before
creating a product (does NOT consume a sequence value — uses
`pg_sequence_last_value` for peek, falls back to formatted nextval).

NOTE: In practice, the trigger is the authoritative code generator.
The RPC is for display purposes only and must never be the sole source
of truth.
*/

-- ============================================================
-- 1. Storage bucket
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  2097152,   -- 2 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 2097152,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Drop existing policies (idempotent)
DROP POLICY IF EXISTS "product_images_select" ON storage.objects;
DROP POLICY IF EXISTS "product_images_insert" ON storage.objects;
DROP POLICY IF EXISTS "product_images_update" ON storage.objects;
DROP POLICY IF EXISTS "product_images_delete" ON storage.objects;

CREATE POLICY "product_images_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "product_images_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "product_images_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY "product_images_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images');

-- ============================================================
-- 2. Product code sequence
-- ============================================================

CREATE SEQUENCE IF NOT EXISTS product_code_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

-- ============================================================
-- 3. Trigger function: set product_code + barcode on INSERT
-- ============================================================

CREATE OR REPLACE FUNCTION set_product_code()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Generate product_code if not supplied
  IF NEW.product_code IS NULL OR trim(NEW.product_code) = '' THEN
    NEW.product_code := 'BRG' || LPAD(nextval('product_code_seq')::text, 6, '0');
  END IF;

  -- Default barcode to product_code if not supplied
  IF NEW.barcode IS NULL OR trim(NEW.barcode) = '' THEN
    NEW.barcode := NEW.product_code;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_set_product_code ON products;
CREATE TRIGGER products_set_product_code
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_product_code();

-- ============================================================
-- 4. RPC: peek at the next product code (display only)
-- ============================================================

CREATE OR REPLACE FUNCTION get_next_product_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  last_val  bigint;
  next_val  bigint;
BEGIN
  -- pg_sequence_last_value returns NULL if the sequence has never been used
  SELECT last_value INTO last_val
  FROM pg_sequences
  WHERE schemaname = 'public' AND sequencename = 'product_code_seq';

  IF last_val IS NULL THEN
    next_val := 1;
  ELSE
    -- Check whether the sequence was actually called (is_called flag)
    SELECT CASE WHEN is_called THEN last_value + 1 ELSE last_value END
    INTO next_val
    FROM product_code_seq;
  END IF;

  RETURN 'BRG' || LPAD(next_val::text, 6, '0');
END;
$$;

-- Grant execute to authenticated role
GRANT EXECUTE ON FUNCTION get_next_product_code() TO authenticated;
