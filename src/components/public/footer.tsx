/**
 * FOOTER
 * ─────────────────────────────────────────────────────────────
 * Edit teks & link → src/lib/site-config.ts → CONTENT.footer
 * Edit warna       → src/lib/site-config.ts → COLORS
 */

import Link from "next/link";
import { CONTENT, COLORS } from "@/lib/site-config";

export function PublicFooter() {
  const t = CONTENT.footer;

  return (
    <footer style={{ backgroundColor: COLORS.pageDark, borderTop: `1px solid ${COLORS.borderDark}` }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-10 pt-16 pb-10">
        <p className="text-2xl font-semibold tracking-wide mb-12" style={{ color: COLORS.textOnDarkMuted }}>
          {t.brandName}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          <div>
            <p className="text-[10px] tracking-widest uppercase mb-5" style={{ color: COLORS.borderDark }}>Explore</p>
            <ul className="space-y-2">
              {t.exploreLinks.map(l => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="text-lg font-semibold transition-colors hover:text-[#c9a96e]"
                    style={{ color: COLORS.textOnDark }}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] tracking-widest uppercase mb-5" style={{ color: COLORS.borderDark }}>All Products</p>
            <ul className="space-y-3">
              {t.productLinks.map(l => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="text-sm transition-colors hover:text-[#F8F6F0]"
                    style={{ color: COLORS.textOnDarkMuted }}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] tracking-widest uppercase mb-5" style={{ color: COLORS.borderDark }}>Go Further</p>
            <ul className="space-y-3">
              {t.supportLinks.map(l => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="text-sm transition-colors hover:text-[#F8F6F0]"
                    style={{ color: COLORS.textOnDarkMuted }}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${COLORS.borderDark}` }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs" style={{ color: COLORS.borderDark }}>© {new Date().getFullYear()} {t.copyright}</p>
          <div className="flex gap-6">
            <Link href="/#contact" className="text-xs transition-colors" style={{ color: COLORS.borderDark }}>Privacy Policy</Link>
            <Link href="/#contact" className="text-xs transition-colors" style={{ color: COLORS.borderDark }}>Terms of Use</Link>
            <Link href="/dashboard" className="text-xs transition-colors hover:text-[#c9a96e]" style={{ color: COLORS.borderDark }}>Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
