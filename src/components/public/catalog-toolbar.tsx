"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { SortOption } from "@/lib/db/public-products";

interface CatalogToolbarProps {
  startItem: number;
  endItem: number;
  totalCount: number;
  currentSort: SortOption;
}

export function CatalogToolbar({
  startItem,
  endItem,
  totalCount,
  currentSort,
}: CatalogToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSort === "default") {
      params.delete("sort");
    } else {
      params.set("sort", newSort);
    }
    // Reset to page 1 on sort change
    params.delete("page");

    startTransition(() => {
      router.push(`/catalog?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-[#E5E0D8] mb-8">
      {/* Left: Result Count */}
      <p className="text-sm text-[#7189A5]">
        {totalCount > 0 ? (
          <>
            Showing{" "}
            <span className="font-medium text-[#1A1A18]">
              {startItem}–{endItem}
            </span>{" "}
            of{" "}
            <span className="font-medium text-[#1A1A18]">{totalCount}</span>{" "}
            results
          </>
        ) : (
          "No results found"
        )}
      </p>

      {/* Right: Sort Dropdown */}
      <div className="flex items-center gap-2 self-start sm:self-auto">
        <label
          htmlFor="catalog-sort"
          className="text-xs sm:text-sm text-[#7189A5] whitespace-nowrap"
        >
          Sort by:
        </label>
        <div className="relative inline-block">
          <select
            id="catalog-sort"
            value={currentSort}
            disabled={isPending}
            onChange={(e) => handleSortChange(e.target.value)}
            className="appearance-none bg-transparent pl-2 pr-7 py-1 text-xs sm:text-sm font-medium text-[#1A1A18] cursor-pointer focus:outline-none focus:ring-0 disabled:opacity-50"
          >
            <option value="default">Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest</option>
            <option value="name-asc">Name: A to Z</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#7189A5] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

