"use client";

import { useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, SlidersHorizontal } from "lucide-react";
import type { Category } from "@/types/database";

interface CatalogFiltersProps {
  categories: Category[];
  currentSearch: string;
  currentCategory: string;
}

/* ─── Catalog sidebar filter — palette: Warm White, Sage, Deep Sage ─────── */
export function CatalogFilters({
  categories,
  currentSearch,
  currentCategory,
}: CatalogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  /** Build a new URL with updated params and navigate to it. */
  const navigate = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      // Always reset to page 1 when filters change
      params.delete("page");

      startTransition(() => {
        router.push(`/catalog?${params.toString()}`, { scroll: false });
      });
    },
    [router, searchParams]
  );

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const value = (fd.get("search") as string)?.trim() || undefined;
    navigate({ search: value });
  };

  const handleCategoryClick = (id: string) => {
    navigate({ category: id || undefined });
  };

  const clearAll = () => {
    startTransition(() => {
      router.push("/catalog", { scroll: false });
    });
  };

  const hasFilters = Boolean(currentSearch || currentCategory);

  return (
    <aside className="relative bg-white border border-[#DDD5C8] overflow-hidden rounded-sm">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-[#DDD5C8]">
        <SlidersHorizontal className="w-4 h-4 text-[#7189A5]" />
        <span className="text-sm font-semibold text-[#292725] flex-1 tracking-wide">
          Filter
        </span>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-[#7189A5] hover:text-[#40566F] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>

      <div className="p-5 space-y-6">
        {/* Search */}
        <div>
          <label
            htmlFor="catalog-search-input"
            className="block text-xs font-semibold text-[#7189A5] uppercase tracking-[0.1em] mb-2.5"
          >
            Search Products
          </label>
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7189A5] pointer-events-none" />
              <input
                id="catalog-search-input"
                type="search"
                name="search"
                defaultValue={currentSearch}
                placeholder="Product name or code..."
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-[#DDD5C8] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#C5A46D]/20 focus:border-[#C5A46D] transition-all bg-[#FAF8F4] text-[#292725] placeholder:text-[#7189A5]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 text-xs font-semibold bg-[#40566F] text-[#FFFFFF] rounded-sm hover:bg-[#2B3E54] transition-colors flex-shrink-0 tracking-wide"
            >
              Search
            </button>
          </form>
        </div>

        {/* Category filter */}
        <div>
          <p className="text-xs font-semibold text-[#7189A5] uppercase tracking-[0.1em] mb-2.5">
            Categories
          </p>
          <div className="space-y-0.5">
            <button
              id="catalog-filter-all"
              onClick={() => handleCategoryClick("")}
              className={`w-full text-left px-3.5 py-2.5 text-sm transition-all rounded-sm ${
                !currentCategory
                  ? "bg-[#C5A46D] text-[#FFFFFF] font-semibold"
                  : "text-[#7189A5] hover:bg-[#EEE9E1] hover:text-[#292725]"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                id={`catalog-filter-${cat.id}`}
                onClick={() => handleCategoryClick(cat.id)}
                className={`w-full text-left px-3.5 py-2.5 text-sm transition-all rounded-sm ${
                  currentCategory === cat.id
                    ? "bg-[#C5A46D] text-[#FFFFFF] font-semibold"
                    : "text-[#7189A5] hover:bg-[#EEE9E1] hover:text-[#292725]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {isPending && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-[#C5A46D] border-r-transparent rounded-full animate-spin" />
        </div>
      )}
    </aside>
  );
}
