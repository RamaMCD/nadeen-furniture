import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import { getPublishedProducts, type SortOption } from "@/lib/db/public-products";
import { getPublicCategories } from "@/lib/db/public-categories";
import { ProductCard } from "@/components/public/product-card";
import { CatalogToolbar } from "@/components/public/catalog-toolbar";
import { CatalogHeaderBar } from "@/components/public/catalog-header-bar";
import { COLORS } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Product Catalog — Nadeen Furniture",
  description:
    "Explore our collection of handcrafted solid wood furniture. Filter by category: living room, bedroom, dining space, and bespoke designs.",
};

const ITEMS_PER_PAGE = 24;

interface CatalogPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;

  const search = params.search?.trim() ?? "";
  const categoryId = params.category ?? "";
  const sort = (params.sort ?? "default") as SortOption;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  // Fetch categories and published products in parallel
  const [categories, { data: products, count }] = await Promise.all([
    getPublicCategories().catch(() => []),
    getPublishedProducts({
      search,
      categoryId,
      sort,
      page,
      limit: ITEMS_PER_PAGE,
    }).catch(() => ({ data: [], count: 0 })),
  ]);

  const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
  const startItem = count === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(page * ITEMS_PER_PAGE, count);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFFFFF" }}>
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <section
        className="pt-24 pb-12 border-b border-[#E5E0D8]"
        style={{ backgroundColor: COLORS.pageBg }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
            <span className="h-px w-6 bg-[#C5A46D]" />
            <span className="text-[11px] font-semibold text-[#C5A46D] tracking-[0.2em] uppercase">
              Handcrafted Collection
            </span>
          </div>
          <h1
            className="font-display text-4xl sm:text-5xl font-medium tracking-tight"
            style={{ color: COLORS.textPrimary }}
          >
            Product Catalog
          </h1>
        </div>
      </section>

      {/* ── Main Catalog Content ─────────────────────────────────────────── */}
      <main className="py-10 lg:py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Category Filter & Search Bar */}
          <CatalogHeaderBar
            categories={categories}
            currentCategory={categoryId}
            currentSearch={search}
          />

          {/* Catalog Toolbar: Showing X-Y of Z results & Sort Dropdown */}
          <CatalogToolbar
            startItem={startItem}
            endItem={endItem}
            totalCount={count}
            currentSort={sort}
          />

          {/* ── Product Grid: 4 columns desktop, 2 columns tablet, 1-2 mobile ── */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 min-[480px]:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 sm:gap-x-8 sm:gap-y-14">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-28 text-center bg-[#FAF8F4] rounded-sm p-8 border border-[#E5E0D8]">
              <div className="w-16 h-16 bg-[#F4EFEA] rounded-full flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-[#7189A5]" />
              </div>
              <h3 className="text-lg font-semibold text-[#1A1A18] mb-2 font-display">
                No Products Found
              </h3>
              <p className="text-[#7189A5] max-w-sm text-sm leading-relaxed">
                {search || categoryId
                  ? "We couldn't find any pieces matching your current filters. Try resetting or adjusting your search query."
                  : "No products are currently published in the catalog. Please check back soon."}
              </p>
              {(search || categoryId) && (
                <Link
                  href="/catalog"
                  className="mt-6 inline-flex items-center text-xs tracking-wider uppercase font-semibold text-[#1A1A18] border-b border-[#1A1A18] pb-0.5 hover:text-[#C5A46D] hover:border-[#C5A46D] transition-colors"
                >
                  View all collections →
                </Link>
              )}
            </div>
          )}

          {/* ── Pagination ─────────────────────────────────────────────────── */}
          {totalPages > 1 && (
            <nav
              className="flex items-center justify-center gap-2 mt-16 pt-8 border-t border-[#E5E0D8]"
              aria-label="Pagination"
            >
              {/* Previous */}
              {page > 1 && (
                <Link
                  href={buildPageUrl(params, page - 1)}
                  className="flex items-center gap-1 px-4 py-2 text-xs uppercase tracking-wider font-medium text-[#1A1A18] hover:text-[#C5A46D] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </Link>
              )}

              {/* Page numbers */}
              <div className="flex items-center gap-1.5">
                {buildPageRange(page, totalPages).map((p, i) =>
                  p === "…" ? (
                    <span
                      key={`ellipsis-${i}`}
                      className="px-2 text-[#7189A5] text-xs"
                    >
                      …
                    </span>
                  ) : (
                    <Link
                      key={p}
                      href={buildPageUrl(params, p as number)}
                      className={`min-w-[2.25rem] h-9 flex items-center justify-center text-xs font-semibold transition-colors rounded-sm ${
                        p === page
                          ? "bg-[#1A1A18] text-[#FAF8F4]"
                          : "text-[#5A5650] hover:text-[#1A1A18] hover:bg-[#F4EFEA]"
                      }`}
                    >
                      {p}
                    </Link>
                  )
                )}
              </div>

              {/* Next */}
              {page < totalPages && (
                <Link
                  href={buildPageUrl(params, page + 1)}
                  className="flex items-center gap-1 px-4 py-2 text-xs uppercase tracking-wider font-medium text-[#1A1A18] hover:text-[#C5A46D] transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </nav>
          )}
        </div>
      </main>
    </div>
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
  if (params.sort && params.sort !== "default") p.set("sort", params.sort);
  if (page > 1) p.set("page", String(page));
  const qs = p.toString();
  return qs ? `/catalog?${qs}` : "/catalog";
}

/**
 * Generate a compact page range array with ellipsis.
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
