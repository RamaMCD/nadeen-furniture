/**
 * HERO SECTION
 * ─────────────────────────────────────────────────────────────
 * Edit teks  → src/lib/site-config.ts → CONTENT.hero
 * Edit warna → src/lib/site-config.ts → COLORS
 * Edit gambar → Admin > Homepage Images > "hero" dan "heroProduct"
 */

import Image from "next/image";
import Link from "next/link";
import { CONTENT, COLORS } from "@/lib/site-config";

interface HeroSectionProps {
  /** URL gambar background — dari Admin > Homepage Images */
  heroBg?: string;
  /** URL gambar produk kecil di tengah teks — dari Admin > Homepage Images */
  heroProduct?: string;
}

export function HeroSection({ heroBg, heroProduct }: HeroSectionProps) {
  const t = CONTENT.hero;

  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: "100vh" }}
    >
      {/* ── Background image — full, tidak buram ─────────────────────
          Gambar: Admin > Homepage Images > "hero"
      ─────────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0">
        <Image
          src={heroBg ?? "/images/hero-living-room.jpg"}
          alt="Nadeen Furniture"
          fill
          className="object-cover object-center"
          priority
          quality={80}
          sizes="100vw"
        />
        {/* Overlay: transparan di atas, hitam tipis di bawah — elegan */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.55) 100%)"
        }} />
      </div>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div
        className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-24 pb-20"
        style={{ minHeight: "100vh" }}
      >
        {/* Eyebrow label — edit: CONTENT.hero.eyebrow */}
        <p
          className="text-xs tracking-[0.2em] uppercase mb-8 animate-fade-up"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          {t.eyebrow}
        </p>

        {/* Spacer — kecil supaya subtitle lebih dekat ke tombol */}
        <div className="h-8" />

        {/* Subtitle — edit: CONTENT.hero.subtitle */}
        <p
          className="text-sm mt-4 mb-5 tracking-wide animate-fade-up animate-delay-200"
          style={{ color: "rgba(255,255,255,0.8)" }}
        >
          {t.subtitle}
        </p>

        {/* CTA Button */}
        <Link
          href={t.ctaHref}
          className="animate-fade-up animate-delay-300 inline-flex items-center gap-2 text-sm font-semibold px-8 py-3 rounded-full transition-colors"
          style={{ backgroundColor: "#F8F6F0", color: "#1a1a18" }}
        >
          {t.ctaLabel}
        </Link>

        {/* Tagline */}
        <p
          className="text-xs mt-4 tracking-wide animate-fade-up animate-delay-400"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          {t.tagline}
        </p>
      </div>
    </section>
  );
}
