import Image from "next/image";
import { COLORS } from "@/lib/site-config";

interface AboutUsSectionProps {
  image: string;
}

export function AboutUsSection({ image }: AboutUsSectionProps) {
  return (
    <section className="py-20 lg:py-28" style={{ backgroundColor: COLORS.pageBg }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <div className="grid items-center gap-10 sm:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-5" style={{ color: COLORS.textMuted }}>
              About Us 
            </p>
            <h2
              className="font-display font-medium leading-tight max-w-xl"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", color: COLORS.textPrimary }}
            >
              Nadeen Furniture by Kencana Dewa Sakti
            </h2>
            <p className="mt-6 max-w-lg text-[18.2px] leading-relaxed" style={{ color: COLORS.textPrimary }}>
              Nadeen Furniture by Kencana Dewa Sakti is a company focused on classic furniture design, inspired by the elegance of European style. Our collection brings together graceful forms, beautiful colours, and carefully considered details. We believe that furniture is more than just part of a room; it adds character, warmth, and a distinct sense of style to every home.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-sm overflow-hidden aspect-[4/5] sm:ml-auto">
            <Image
              src={image}
              alt="Nadeen artisans crafting solid wood furniture"
              fill
              loading="lazy"
              className="object-cover object-center"
              quality={80}
              sizes="(max-width: 640px) 100vw, 384px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
