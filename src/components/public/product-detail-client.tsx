"use client";

import Image from "next/image";
import * as React from "react";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicProductImage } from "@/lib/db/public-products";

export interface ProductDetailGalleryImage {
  id: string;
  image_url: string;
  alt_text?: string | null;
  is_primary?: boolean;
  display_order?: number;
}

interface ProductDetailClientProps {
  images?: Array<ProductDetailGalleryImage | PublicProductImage>;
  /** Legacy fallback when no gallery images exist. */
  imageUrl?: string | null;
  productName: string;
}

function normalizeImages(
  images: Array<ProductDetailGalleryImage | PublicProductImage> | undefined,
  imageUrl: string | null | undefined,
  productName: string
): ProductDetailGalleryImage[] {
  const fromGallery = (images ?? []).filter((img) => img?.image_url);
  if (fromGallery.length > 0) {
    return [...fromGallery].sort((a, b) => {
      const ao = a.display_order ?? 0;
      const bo = b.display_order ?? 0;
      if (ao !== bo) return ao - bo;
      return Number(Boolean(b.is_primary)) - Number(Boolean(a.is_primary));
    });
  }
  if (imageUrl) {
    return [{ id: "legacy", image_url: imageUrl, alt_text: productName, is_primary: true, display_order: 0 }];
  }
  return [];
}

export function ProductDetailClient({ images, imageUrl, productName }: ProductDetailClientProps) {
  const normalized = React.useMemo(
    () => normalizeImages(images, imageUrl, productName),
    [images, imageUrl, productName]
  );
  const primaryIndex = Math.max(0, normalized.findIndex((img) => img.is_primary));
  const [activeIndex, setActiveIndex] = React.useState(primaryIndex);
  const [loaded, setLoaded] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    setActiveIndex(Math.max(0, normalized.findIndex((img) => img.is_primary)));
  }, [normalized]);

  const active = normalized[activeIndex] ?? normalized[0];

  return (
    <div className="w-full">
      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row">
        {/* Thumbnails: vertical on desktop, horizontal on mobile */}
        {normalized.length > 1 && (
          <div
            className="order-2 flex gap-2 overflow-x-auto pb-1 lg:order-1 lg:max-h-[560px] lg:w-[84px] lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pb-0"
            role="tablist"
            aria-label="Product images"
          >
            {normalized.map((img, idx) => {
              const selected = idx === activeIndex;
              return (
                <button
                  key={img.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-label={`View image ${idx + 1}`}
                  onClick={() => setActiveIndex(idx)}
                  className={cn(
                    "relative h-16 w-16 shrink-0 overflow-hidden rounded-sm border bg-[#FAF8F4] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A46D] focus-visible:ring-offset-2 sm:h-[72px] sm:w-[72px] lg:h-[72px] lg:w-full",
                    selected
                      ? "border-[#C5A46D] ring-1 ring-[#C5A46D]/40"
                      : "border-[#E5E0D8] hover:border-[#C5A46D]/60"
                  )}
                >
                  <Image
                    src={img.image_url}
                    alt={img.alt_text || `${productName} thumbnail ${idx + 1}`}
                    fill
                    className="object-contain p-1.5"
                    sizes="72px"
                  />
                </button>
              );
            })}
          </div>
        )}

        {/* Main image */}
        <div className="order-1 min-w-0 flex-1 lg:order-2">
          <div
            className="relative w-full overflow-hidden rounded-sm"
            style={{ backgroundColor: "#FAF8F4", aspectRatio: "4 / 3" }}
          >
            {active ? (
              <>
                <Image
                  key={active.id}
                  src={active.image_url}
                  alt={active.alt_text || productName}
                  fill
                  priority
                  quality={90}
                  className={cn(
                    "object-contain p-4 transition-opacity duration-300 sm:p-8 lg:p-10",
                    loaded[active.id] ? "opacity-100" : "opacity-0"
                  )}
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  onLoad={() => setLoaded((s) => ({ ...s, [active.id]: true }))}
                  onError={() => setLoaded((s) => ({ ...s, [active.id]: true }))}
                />
                {!loaded[active.id] && (
                  <div className="absolute inset-0 animate-pulse bg-[#EEE9E1]" aria-hidden="true" />
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#7189A5]">
                <Package className="h-16 w-16 opacity-25" />
                <span className="text-xs font-medium uppercase tracking-wider text-[#7189A5]/60">
                  Image unavailable
                </span>
              </div>
            )}
          </div>

          <p className="mt-3 text-center text-[11px] tracking-wide text-[#A09890]">
            {active ? active.alt_text || productName : "No image on file"}
            {normalized.length > 1 ? (
              <span className="text-[#C8C0B4]"> · {activeIndex + 1}/{normalized.length}</span>
            ) : null}
          </p>
        </div>
      </div>
    </div>
  );
}
