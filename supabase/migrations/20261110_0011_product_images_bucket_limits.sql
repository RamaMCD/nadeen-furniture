/*
# Adjust `product-images` storage bucket limits for furniture catalog uploads

The previous bucket configuration (migration 0002) set `file_size_limit = 2 MB`,
which rejects large camera photos before the app can store them.

This migration:
- Raises `file_size_limit` to 10 MB to safely accommodate optimized uploads and
  remain compatible with common Supabase project limits.
- Ensures allowed MIME types cover formats used by the admin upload flow
  (JPEG, PNG, WebP, AVIF). Client-side optimization converts uploads to
  efficient, compatible formats before storage.
- Keeps the existing bucket/policies; does not create a new bucket and does not
  change unrelated storage configuration.

Safe to run multiple times.
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  10485760, -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = GREATEST(COALESCE(storage.buckets.file_size_limit, 0), EXCLUDED.file_size_limit),
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
