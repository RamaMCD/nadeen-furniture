"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import type { Category } from "@/types/database";

interface CatalogHeaderBarProps {
  categories: Category[];
  currentCategory: string;
  currentSearch: string;
}

export function CatalogHeaderBar({
  categories,
  currentCategory,
  currentSearch,
}: CatalogHeaderBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const handleCategorySelect = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) {
      params.set("category", categoryId);
    } else {
      params.delete("category");
    }
    params.delete("page");

    startTransition(() => {
      router.push(`/catalog?${params.toString()}`, { scroll: false });
    });
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const value = (fd.get("search") as string)?.trim();
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.delete("page");

    startTransition(() => {
      router.push(`/catalog?${params.toString()}`, { scroll: false });
    });
  };

  const clearSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("page");
    startTransition(() => {
      router.push(`/catalog?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      {/* Category Pills / Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none text-xs sm:text-sm">
        <button
          onClick={() => handleCategorySelect("")}
          className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors duration-200 font-medium ${
            !currentCategory
              ? "bg-[#1A1A18] text-[#FAF8F4]"
              : "bg-[#F4EFEA] text-[#5A5650] hover:bg-[#EAE4DC] hover:text-[#1A1A18]"
          }`}
        >
          All Pieces
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategorySelect(cat.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors duration-200 font-medium ${
              currentCategory === cat.id
                ? "bg-[#1A1A18] text-[#FAF8F4]"
                : "bg-[#F4EFEA] text-[#5A5650] hover:bg-[#EAE4DC] hover:text-[#1A1A18]"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative w-full md:w-64">
        <Search className="w-4 h-4 text-[#7189A5] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="search"
          name="search"
          defaultValue={currentSearch}
          placeholder="Search catalog..."
          className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-[#FFFFFF] border border-[#E5E0D8] rounded-full focus:outline-none focus:border-[#C5A46D] text-[#1A1A18] placeholder:text-[#7189A5]/70 transition-colors"
        />
        {currentSearch && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7189A5] hover:text-[#1A1A18]"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </form>
    </div>
  );
}

