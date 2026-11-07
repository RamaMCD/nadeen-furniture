/**
 * COMPANY INTRO — "Uniqueness and Quality"
 * ─────────────────────────────────────────────────────────────
 * Edit teks  → src/lib/site-config.ts → CONTENT.intro
 * Edit warna → src/lib/site-config.ts → COLORS
 * Edit gambar → Admin > Homepage Images > "introMain", "introLeft", "introRight"
 */

import Image from "next/image";
import { CONTENT, COLORS } from "@/lib/site-config";
import { FRAME_GROUP_CLASS } from "@/lib/homepage-frames";

interface CompanyIntroProps {
  /** Gambar besar atas — Admin > Homepage Images > "introMain" */
  introMain?: string;
  /** Gambar kiri bawah — Admin > Homepage Images > "introLeft" */
  introLeft?: string;
  /** Gambar kanan bawah — Admin > Homepage Images > "introRight" */
  introRight?: string;
}

export function CompanyIntro({ introMain, introLeft, introRight }: CompanyIntroProps) {
  const t = CONTENT.intro;

  return (
    <section className="py-24 lg:py-32" style={{ backgroundColor: COLORS.pageBg }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-10">

        <div className="mb-12">
          <h2
            className="font-display font-medium leading-tight whitespace-pre-line"
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              letterSpacing: "-0.02em",
              lineHeight: 1.0,
              color: COLORS.textPrimary,
            }}
          >
            {t.title}
          </h2>
        </div>

        {/* ── Photo grid ───────────────────────────────────────────────
            Foto atas:       Admin > Homepage Images > "introMain"
            Foto kiri bawah: Admin > Homepage Images > "introLeft"
            Foto kanan bawah:Admin > Homepage Images > "introRight"
        ─────────────────────────────────────────────────────────────── */}
        <div className={`${FRAME_GROUP_CLASS} flex flex-col gap-2`}>
          {/* Top — 16:9 landscape */}
          <div className="relative w-full overflow-hidden aspect-video">
            <Image
              src={introMain ?? "/images/hero-living-room.jpg"}
              alt="Nadeen Furniture Collection"
              fill
              loading="lazy"
              className="object-cover object-center"
              quality={80}
              sizes="(max-width: 896px) 100vw, 896px"
            />
          </div>

          {/* Bottom — dua kolom 4:5 portrait */}
          <div className="grid grid-cols-2 gap-2">
            <div className="relative overflow-hidden aspect-[4/5]">
              <Image
                src={introLeft ?? "/images/craftsmanship.jpg"}
                alt="Handcrafted Workmanship"
                fill
                loading="lazy"
                className="object-cover object-center"
                quality={80}
                sizes="(max-width: 896px) 50vw, 448px"
              />
            </div>
            <div
              className="relative overflow-hidden aspect-[4/5]"
              style={{ backgroundColor: "#1a1a1a" }}
            >
              <Image
                src={introRight ?? "/images/catalog-cta-bg.jpg"}
                alt="Material Quality"
                fill
                loading="lazy"
                className="object-cover object-center"
                quality={80}
                sizes="(max-width: 896px) 50vw, 448px"
              />
            </div>
          </div>
        </div>

        {/* ── Deskripsi dua kolom ───────────────────────────────────────
            Edit: CONTENT.intro.descLeft dan CONTENT.intro.descRight
        ─────────────────────────────────────────────────────────────── */}
        <div className={`${FRAME_GROUP_CLASS} grid sm:grid-cols-2 gap-8 mt-10`}>
          <p className="text-sm leading-relaxed text-justify" style={{ color: COLORS.textSecondary }}>
            {t.descLeft}
          </p>
          <p className="text-sm leading-relaxed text-justify" style={{ color: COLORS.textSecondary }}>
            {t.descRight}
          </p>
        </div>
      </div>
    </section>
  );
}
