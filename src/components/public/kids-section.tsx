/**
 * CONTACT / STATS SECTION — "Hubungi Kami"
 * ─────────────────────────────────────────────────────────────
 * Edit teks  → src/lib/site-config.ts → CONTENT.contact
 * Edit warna → src/lib/site-config.ts → COLORS
 * Edit gambar → Admin > Homepage Images > "statsMain"
 */

import Image from "next/image";
import { Instagram, Link2, MapPin, MessageCircle } from "lucide-react";
import { CONTENT, COLORS } from "@/lib/site-config";
import { FRAME_GROUP_CLASS } from "@/lib/homepage-frames";

interface KidsSectionProps {
  /** Foto utama — Admin > Homepage Images > "statsMain" */
  statsMain?: string;
}

export function KidsSection({ statsMain }: KidsSectionProps) {
  const contact = CONTENT.contact;
  const contactItems = [
    {
      label: "ADDRESS",
      value: "9P83+FVP, Jokosari, Ngabul, Kec. Tahunan, Kabupaten Jepara, Jawa Tengah 59428, Indonesia",
      href: "https://www.google.com/maps/search/?api=1&query=9P83%2BFVP%2C+Jokosari%2C+Ngabul%2C+Kec.+Tahunan%2C+Kabupaten+Jepara%2C+Jawa+Tengah+59428%2C+Indonesia",
      icon: MapPin,
      external: true,
    },
    {
      label: "INSTAGRAM",
      value: "@nadeen_furniture",
      href: "https://www.instagram.com/nadeen_furniture",
      icon: Instagram,
      external: true,
    },
    {
      label: "WHATSAPP",
      value: "+62 851-1307-2901",
      href: "https://wa.me/6285113072901",
      icon: MessageCircle,
      external: true,
    },
    {
      label: "LINKTREE",
      value: "linktr.ee/Nadeen.Furniture",
      href: "https://linktr.ee/Nadeen.Furniture",
      icon: Link2,
      external: true,
    },
  ];

  return (
    <section
      id="contact"
      className="scroll-mt-16 py-24 lg:py-32"
      style={{ backgroundColor: COLORS.pageDark, borderTop: `1px solid ${COLORS.borderDark}` }}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <h2
          className="font-display font-medium text-center mb-4 leading-tight"
          style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-0.02em", color: COLORS.textOnDark }}
        >
          Contact Us
        </h2>
        <p
          className="text-sm text-center max-w-lg mx-auto mb-16 leading-relaxed"
          style={{ color: COLORS.textOnDarkMuted }}
        >
          For product inquiries, custom commissions, or workshop visits, reach out to us through our official channels.
        </p>

        {/* Foto utama — 16:9 landscape */}
        <div className={`${FRAME_GROUP_CLASS} mb-16`}>
          <div
            className="w-full p-1.5"
            style={{ backgroundColor: COLORS.sectionAlt }}
          >
            <div className="relative overflow-hidden w-full aspect-video">
              <Image
                src={statsMain ?? "/images/hero-living-room.jpg"}
                alt="Nadeen furniture collection"
                fill
                loading="lazy"
                className="object-cover object-center"
                quality={80}
                sizes="(max-width: 896px) 100vw, 896px"
              />
            </div>
          </div>
        </div>

        {/* 4 Contact Info Items */}
        <div
          className="grid w-full grid-cols-1 gap-x-8 gap-y-7 border-t pt-8 sm:grid-cols-2 lg:grid-cols-4"
          style={{ borderColor: COLORS.borderDark }}
        >
          {contactItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="group flex items-start gap-3 transition-opacity hover:opacity-80"
            >
              <item.icon
                size={18}
                className="mt-0.5 shrink-0"
                style={{ color: COLORS.gold }}
                aria-hidden="true"
              />
              <span className="min-w-0">
                <span
                  className="block text-xs font-semibold uppercase tracking-wider"
                  style={{ color: COLORS.textOnDarkMuted }}
                >
                  {item.label}
                </span>
                <span
                  className={`mt-1 block text-sm leading-relaxed transition-colors ${
                    item.label === "ADDRESS" ? "break-words" : "whitespace-nowrap"
                  }`}
                  style={{ color: COLORS.textOnDark }}
                >
                  {item.value}
                </span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
