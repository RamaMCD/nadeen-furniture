/**
 * CATALOG CTA SECTION — "Lihat Lebih Dekat"
 * ─────────────────────────────────────────────────────────────
 * Edit teks  → src/lib/site-config.ts → CONTENT.catalogCta
 * Edit warna → src/lib/site-config.ts → COLORS
 * Edit gambar → Admin > Homepage Images > "catalogFeature"
 */

import Image from "next/image";
import Link from "next/link";
import { CONTENT, COLORS } from "@/lib/site-config";

interface CatalogCtaSectionProps {
  /** Foto featured product — Admin > Homepage Images > "catalogFeature" */
  catalogFeature?: string;
  catalogFeature2?: string;
  catalogFeature3?: string;
  catalogFeature4?: string;
  catalogFeatureLandscape?: string;
  catalogFeature5?: string;
  catalogFeature6?: string;
}

export function CatalogCtaSection({
  catalogFeature,
  catalogFeature2,
  catalogFeature3,
  catalogFeature4,
  catalogFeatureLandscape,
  catalogFeature5,
  catalogFeature6,
}: CatalogCtaSectionProps) {
  const t = CONTENT.catalogCta;
  const photos = [
    { src: catalogFeature ?? "/images/catalog-cta-bg.jpg", alt: "Nadeen Furniture Collection 1", landscape: false },
    { src: catalogFeature2 ?? "/images/hero-living-room.jpg", alt: "Nadeen Furniture Collection 2", landscape: false },
    { src: catalogFeature3 ?? "/images/craftsmanship.jpg", alt: "Nadeen Furniture Collection 3", landscape: false },
    { src: catalogFeature4 ?? "/images/catalog-cta-bg.jpg", alt: "Nadeen Furniture Collection 4", landscape: false },
    { src: catalogFeatureLandscape ?? "/images/hero-living-room.jpg", alt: "Nadeen Furniture Collection landscape", landscape: true },
    { src: catalogFeature5 ?? "/images/craftsmanship.jpg", alt: "Nadeen Furniture Collection 5", landscape: false },
    { src: catalogFeature6 ?? "/images/catalog-cta-bg.jpg", alt: "Nadeen Furniture Collection 6", landscape: false },
  ];

  return (
    <section
      className="py-24 lg:py-32"
      style={{ backgroundColor: COLORS.pageBg, borderTop: `1px solid ${COLORS.border}` }}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <h2 className="font-light mb-16" style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", color: COLORS.textPrimary }}>
          {t.sectionTitle}
        </h2>

        {/* ── Featured product ──────────────────────────────────────────
            Gambar: Admin > Homepage Images > "catalogFeature"
        ─────────────────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center">
          <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {photos.map((photo) => (
              <div
                key={photo.alt}
                className={`relative overflow-hidden ${photo.landscape ? "col-span-2 aspect-video sm:self-center" : "aspect-[4/5]"}`}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  loading="lazy"
                  className="object-cover object-center"
                  quality={80}
                  sizes={photo.landscape ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 640px) 50vw, 25vw"}
                />
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <h3 className="font-display font-medium text-2xl mb-1" style={{ color: COLORS.textPrimary }}>
              {t.productName}
            </h3>
            <p className="text-sm mb-6" style={{ color: COLORS.textSecondary }}>
              {t.productSub}
            </p>
            <Link
              href="/catalog"
              className="inline-flex text-sm font-semibold px-8 py-3 rounded-full transition-colors"
              style={{ backgroundColor: COLORS.btnPrimaryBg, color: COLORS.btnPrimaryText }}
            >
              {t.ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
