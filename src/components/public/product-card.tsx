import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PublicProduct } from "@/lib/db/public-products";
import { COLORS } from "@/lib/site-config";

interface ProductCardProps {
  product: PublicProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="overflow-hidden flex flex-col border border-[#1A1A1A]" style={{ backgroundColor: "#FFFFFF" }}>
      {/* Product image */}
      <div
        className="relative overflow-hidden aspect-[4/5]"
        style={{ backgroundColor: "#FFFFFF" }}
      >
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            loading="lazy"
            quality={80}
            className="object-cover grayscale-[15%]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 opacity-15">
              <rect x="4" y="12" width="40" height="24" rx="2" stroke={COLORS.textSecondary} strokeWidth="2"/>
              <path d="M4 20 Q14 18 24 22 Q34 26 44 20" stroke={COLORS.textSecondary} strokeWidth="1.5" fill="none"/>
              <path d="M4 28 Q14 24 24 28 Q34 32 44 28" stroke={COLORS.textSecondary} strokeWidth="1.5" fill="none"/>
            </svg>
            <span className="text-[10px] tracking-wide" style={{ color: COLORS.textSecondary }}>No image</span>
          </div>
        )}

      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-medium text-sm leading-snug mb-1.5 line-clamp-2 flex-1" style={{ color: COLORS.textPrimary }}>
          {product.name}
        </h3>
        <p className="text-[10px] font-mono mb-4" style={{ color: COLORS.textSecondary }}>{product.product_code}</p>

        <Link
          href={`/catalog/${product.id}`}
          className="flex items-center justify-between w-full text-xs tracking-[0.08em] uppercase border-t pt-4 hover:opacity-70"
          style={{ color: COLORS.textPrimary, borderColor: COLORS.borderMid }}
        >
          <span>Lihat Detail</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}
