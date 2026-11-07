-- ─────────────────────────────────────────────────────────────
-- Migration: Homepage Images table
-- Menyimpan URL gambar yang bisa diubah dari Admin > Homepage Images
-- ─────────────────────────────────────────────────────────────

create table if not exists public.homepage_images (
  key         text primary key,
  url         text not null,
  updated_at  timestamptz not null default now()
);

-- Hanya authenticated users (admin) yang bisa insert/update/delete
alter table public.homepage_images enable row level security;

create policy "Admin can manage homepage images"
  on public.homepage_images
  for all
  to authenticated
  using (true)
  with check (true);

-- Public bisa baca (untuk tampil di website)
create policy "Public can read homepage images"
  on public.homepage_images
  for select
  to anon
  using (true);
