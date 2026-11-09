"use client";

import Image from "next/image";
import { Package } from "lucide-react";

interface ProductDetailClientProps {
  imageUrl: string | null;
  productName: string;
}

/**
 * Client component: renders the product image gallery.
 *
 * Since the DB only stores a single `image_url` per product, this component
 * simply shows that one image in a large, premium format.  When/if the DB
 * schema is later extended to support multiple images, only this component
 * needs to be updated.
 */
export function ProductDetailClient({
  imageUrl,
  productName,
}: ProductDetailClientProps) {
  return (
    <div className="w-full">
      {/* ── Main image ───────────────────────────────────────────────────── */}
      <div
        className="relative w-full overflow-hidden rounded-sm"
        style={{
          backgroundColor: "#FFFFFF",
          aspectRatio: "4 / 3",
        }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={productName}
            fill
            priority
            quality={90}
            className="object-contain p-6 sm:p-10"
            sizes="(max-width: 1024px) 100vw, 55vw"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#7189A5]">
            <Package className="w-16 h-16 opacity-25" />
            <span className="text-xs uppercase tracking-wider text-[#7189A5]/60 font-medium">
              Image unavailable
            </span>
          </div>
        )}
      </div>

      {/* Subtle caption line */}
      <p className="mt-3 text-[11px] text-[#A09890] text-center tracking-wide">
        {imageUrl ? productName : "No image on file"}
      </p>
    </div>
  );
}

