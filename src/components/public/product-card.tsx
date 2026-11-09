import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import type { PublicProduct } from "@/lib/db/public-products";

interface ProductCardProps {
  product: PublicProduct;
  variant?: "light" | "dark";
}

export function ProductCard({ product, variant = "light" }: ProductCardProps) {
  const categoryName = product.categories?.name ?? "Collection";
  const isDark = variant === "dark";

  return (
    <Link
      href={`/catalog/${product.id}`}
      className="group block text-left"
    >
      {/* ── Product Image Container (Consistent 4:3 Aspect Ratio) ────── */}
      <div
        className={`relative aspect-[4/3] w-full overflow-hidden rounded-sm flex items-center justify-center p-3 sm:p-4 transition-colors duration-300 ${
          isDark
            ? "bg-[#1E1E1E] group-hover:bg-[#252525]"
            : "bg-[#F8F7F4] group-hover:bg-[#F2EFE8]"
        }`}
      >
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            loading="lazy"
            quality={85}
            className="object-contain p-2 sm:p-3 transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-[#7189A5]">
            <Package className="w-8 h-8 opacity-35" />
            <span className="text-[11px] uppercase tracking-wider text-[#7189A5]/60 font-medium">
              No image
            </span>
          </div>
        )}
      </div>

      {/* ── Product Information ───────────────────────────────────────── */}
      <div className="pt-3.5 pb-1 flex flex-col items-start space-y-1">
        {/* Product Name */}
        <h3
          className={`font-medium text-sm sm:text-base line-clamp-1 leading-snug transition-colors ${
            isDark
              ? "text-[#F5F0E8] group-hover:text-[#C9A96E]"
              : "text-[#1A1A18] group-hover:text-[#C5A46D]"
          }`}
        >
          {product.name}
        </h3>

        {/* Product Category */}
        <p className={`text-xs tracking-wide ${isDark ? "text-[#C9A96E]" : "text-[#7189A5]"}`}>
          {categoryName}
        </p>

      </div>
    </Link>
  );
}
