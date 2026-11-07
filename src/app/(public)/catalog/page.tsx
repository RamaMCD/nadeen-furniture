import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import { getPublishedProducts } from "@/lib/db/public-products";
import { ProductCard } from "@/components/public/product-card";
import { COLORS } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Product Catalog — Nadeen Furniture",
  description:
    "Jelajahi koleksi furniture kayu solid berkualitas dari Nadeen Furniture. Filter berdasarkan kategori: ruang tamu, kamar tidur, ruang makan, dan furniture anak.",
};

const ITEMS_PER_PAGE = 12;

interface CatalogPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    page?: string;
  }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;

  const search = params.search?.trim() ?? "";
  const categoryId = params.category ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  const { data: products, count } = await getPublishedProducts({
    search,
    categoryId,
    page,
    limit: ITEMS_PER_PAGE,
  }).catch(() => ({ data: [], count: 0 }));

  const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
  const startItem = count === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(page * ITEMS_PER_PAGE, count);

  return (
    <>
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="pt-24 pb-10" style={{ backgroundColor: COLORS.pageBg }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <h1 className="font-display text-4xl font-medium" style={{ color: COLORS.textPrimary }}>
            Product Catalog
          </h1>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="py-12 min-h-[60vh]" style={{ backgroundColor: "#FAF8F4" }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="w-full">
              {/* Results bar */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-[#7189A5]">
                  {count > 0 ? (
                    <>
                      Menampilkan{" "}
                      <strong className="text-[#292725]">{startItem}–{endItem}</strong>{" "}
                      dari <strong className="text-[#292725]">{count}</strong>{" "}
                      produk
                    </>
                  ) : (
                    "Tidak ada produk ditemukan"
                  )}
                </p>
              </div>

              {/* Grid */}
              {products.length > 0 ? (
                <div className="grid sm:grid-cols-3 xl:grid-cols-4 gap-5">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                /* Empty state */
                <div className="flex flex-col items-center justify-center py-28 text-center">
                  <div className="w-20 h-20 bg-[#DDD5C8] rounded-sm flex items-center justify-center mb-5">
                    <Package className="w-10 h-10 text-[#7189A5]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#292725] mb-2">
                    Produk Tidak Ditemukan
                  </h3>
                  <p className="text-[#7189A5] max-w-sm text-sm">
                    {search || categoryId
                      ? "Coba ubah kata kunci pencarian atau pilih kategori lain."
                      : "Belum ada produk yang dipublikasikan di katalog."}
                  </p>
                  {(search || categoryId) && (
                    <Link
                      href="/catalog"
                      className="mt-5 text-sm font-semibold text-[#40566F] hover:underline"
                    >
                      Lihat semua produk →
                    </Link>
                  )}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <nav
                  className="flex items-center justify-center gap-1.5 mt-10"
                  aria-label="Pagination"
                >
                  {/* Previous */}
                  {page > 1 && (
                    <Link
                      href={buildPageUrl(params, page - 1)}
                      className="flex items-center gap-1 px-3.5 py-2 text-sm font-medium bg-white border border-[#DDD5C8] text-[#7189A5] hover:bg-[#EEE9E1] transition-colors rounded-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Prev
                    </Link>
                  )}

                  {/* Page numbers */}
                  {buildPageRange(page, totalPages).map((p, i) =>
                    p === "…" ? (
                      <span
                        key={`ellipsis-${i}`}
                        className="px-2 text-[#7189A5] text-sm"
                      >
                        …
                      </span>
                    ) : (
                      <Link
                        key={p}
                        href={buildPageUrl(params, p as number)}
                        className={`min-w-[2.25rem] h-9 flex items-center justify-center text-sm font-medium transition-colors rounded-sm ${
                          p === page
                            ? "bg-[#C5A46D] text-[#FFFFFF] shadow-sm"
                            : "bg-white border border-[#DDD5C8] text-[#7189A5] hover:bg-[#EEE9E1]"
                        }`}
                      >
                        {p}
                      </Link>
                    )
                  )}

                  {/* Next */}
                  {page < totalPages && (
                    <Link
                      href={buildPageUrl(params, page + 1)}
                      className="flex items-center gap-1 px-3.5 py-2 text-sm font-medium bg-white border border-[#DDD5C8] text-[#7189A5] hover:bg-[#EEE9E1] transition-colors rounded-sm"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </nav>
              )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildPageUrl(
  params: Record<string, string | undefined>,
  page: number
): string {
  const p = new URLSearchParams();
  if (params.search) p.set("search", params.search);
  if (params.category) p.set("category", params.category);
  if (page > 1) p.set("page", String(page));
  const qs = p.toString();
  return qs ? `/catalog?${qs}` : "/catalog";
}

/**
 * Generate a compact page range array with ellipsis, e.g.:
 * [1, 2, 3, "…", 10] or [1, "…", 4, 5, 6, "…", 10]
 */
function buildPageRange(
  current: number,
  total: number
): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const range: (number | string)[] = [1];

  if (current > 3) range.push("…");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) range.push(i);

  if (current < total - 2) range.push("…");
  range.push(total);

  return range;
}
