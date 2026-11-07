/**
 * PROCESS SECTION — "Kenali Produk & Material Kami"
 * ─────────────────────────────────────────────────────────────
 * Edit teks  → src/lib/site-config.ts → CONTENT.process
 * Edit warna → src/lib/site-config.ts → COLORS
 * Edit gambar → Admin > Homepage Images > process image slots
 */

import Image from "next/image";
import { CONTENT, COLORS } from "@/lib/site-config";
import { FRAME_GROUP_CLASS } from "@/lib/homepage-frames";

interface ProcessSectionProps {
  /** Foto besar material — Admin > Homepage Images > "processMaterial" */
  processMaterial?: string;
  /** Foto kiri — Admin > Homepage Images > "processLeft" */
  processLeft?: string;
  /** Foto tengah — Admin > Homepage Images > "processCenter" */
  processCenter?: string;
  /** Foto kanan — Admin > Homepage Images > "processRight" */
  processRight?: string;
}

export function ProcessSection({ processMaterial, processLeft, processCenter, processRight }: ProcessSectionProps) {
  const t = CONTENT.process;
  const detailPhotos = [
    { src: processLeft ?? "/images/hero-living-room.jpg", alt: "Koleksi furniture" },
    { src: processCenter ?? "/images/craftsmanship.jpg", alt: "Pengerjaan furniture" },
    { src: processRight ?? "/images/catalog-cta-bg.jpg", alt: "Detail furniture" },
  ];

  return (
    <section
      className="py-24 lg:py-32"
      style={{ backgroundColor: COLORS.pageDark, borderTop: `1px solid ${COLORS.borderDark}` }}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-10">

        <div className="grid gap-8 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] sm:items-start sm:gap-x-8 sm:gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,448px)] lg:gap-x-16">
          <div className="flex flex-col items-start sm:col-start-1 sm:row-start-1">
            <h2
              className="font-display font-medium leading-tight"
              style={{
                fontSize: "clamp(1.75rem, 4vw, 3rem)",
                letterSpacing: "-0.02em",
                color: COLORS.textOnDark,
              }}
            >
              {t.title}
            </h2>
            <p className="mt-6 max-w-lg text-[18.2px] leading-relaxed" style={{ color: COLORS.textOnDark }}>
              {t.subtitle}
            </p>
            <p className="mt-6 max-w-lg text-[18.2px] leading-relaxed" style={{ color: COLORS.textOnDark }}>
              {t.bodyText}
            </p>
          </div>
          <div className="relative w-full overflow-hidden aspect-[4/5] sm:col-start-2 sm:row-start-1">
            <Image
              src={processMaterial ?? "/images/craftsmanship.jpg"}
              alt="Material kayu solid Nadeen"
              fill
              loading="lazy"
              className="object-cover object-center"
              quality={80}
              sizes="(max-width: 448px) 100vw, 448px"
            />
          </div>

          {/* Tiga frame dimulai setelah foto utama dan turun satu per tiga tinggi frame */}
          <div
            className="grid w-full grid-cols-3 items-start gap-3 sm:col-span-2 sm:col-start-1 sm:row-start-2"
            style={{ containerType: "inline-size" }}
          >
            {detailPhotos.map((photo, index) => (
              <div
                key={photo.alt}
                className="relative overflow-hidden aspect-[4/5]"
                style={{
                  marginTop: index === 0 ? undefined : `calc(${index * 13.8889}cqi - ${index * 3.3333}px)`,
                }}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  loading="lazy"
                  className="object-cover object-center"
                  quality={75}
                  sizes="(max-width: 640px) 30vw, 144px"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div className="mt-16 pt-12 text-center" style={{ borderTop: `1px solid ${COLORS.borderDark}` }}>
          <p className="text-lg font-light italic" style={{ color: COLORS.textOnDark }}>
            {t.quote}
          </p>
        </div>
      </div>
    </section>
  );
}
