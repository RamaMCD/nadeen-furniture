/**
 * CUSTOMER REVIEWS SECTION
 * ─────────────────────────────────────────────────────────────
 * Edit teks  → src/lib/site-config.ts → CONTENT.reviews
 * Edit warna → src/lib/site-config.ts → COLORS
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CONTENT, COLORS } from "@/lib/site-config";

export function CtaSection() {
  const t = CONTENT.reviews;

  return (
    <section
      className="py-24 lg:py-32"
      style={{ backgroundColor: COLORS.pageBg, borderTop: `1px solid ${COLORS.border}` }}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <div className="flex items-baseline justify-between mb-12">
          <h2 className="font-light" style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", color: COLORS.textMuted }}>
            {t.sectionTitle}
          </h2>
          <Link href="/catalog" className="text-sm flex items-center gap-1 transition-colors" style={{ color: COLORS.textSecondary }}>
            Shop Now <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {t.items.map((r, i) => (
            <div key={i} className="rounded-2xl p-6 flex flex-col justify-between"
              style={{ backgroundColor: COLORS.sectionAlt, border: `1px solid ${COLORS.border}`, minHeight: "200px" }}>
              <div>
                <h3 className="font-semibold text-sm leading-snug mb-3" style={{ color: COLORS.textPrimary }}>{r.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: COLORS.textMuted }}>{r.body}</p>
              </div>
              <div className="flex justify-end mt-6">
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all"
                  style={{ border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary }}>→</button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          {["‹", "›"].map(arrow => (
            <button key={arrow} className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
              style={{ border: `1px solid ${COLORS.border}`, color: COLORS.textMuted }}>{arrow}</button>
          ))}
        </div>
      </div>
    </section>
  );
}
