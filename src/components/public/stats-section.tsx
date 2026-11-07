import { Award, Package, Users, Sparkles } from "lucide-react";

const STATS = [
  {
    icon: Award,
    value: "20+",
    label: "Tahun Pengalaman",
    description: "Berdiri dan melayani sejak 2005",
  },
  {
    icon: Package,
    value: "500+",
    label: "Jenis Produk",
    description: "Tersedia di katalog kami",
  },
  {
    icon: Users,
    value: "1.000+",
    label: "Keluarga Bahagia",
    description: "Yang sudah mempercayai kami",
  },
  {
    icon: Sparkles,
    value: "100%",
    label: "Solid Wood",
    description: "Kayu solid pilihan, bukan partikel",
  },
];

/* ─── Section background: Sage Mist #EEE9E1 (natural rhythm accent section) ──
   Natural stats strip — warm, earthy, trustworthy
──────────────────────────────────────────────────────────────────────────── */
export function StatsSection() {
  return (
    <section id="stats" className="py-20 relative overflow-hidden" style={{ backgroundColor: "#EEE9E1" }}>
      {/* Subtle dot texture */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #40566F 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`text-center ${
                  i < STATS.length - 1
                    ? "lg:border-r lg:border-[#40566F]/15 lg:pr-4"
                    : ""
                }`}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#C5A46D]/15 rounded-sm mb-4 mx-auto">
                  <Icon className="w-6 h-6 text-[#40566F]" />
                </div>
                <div className="font-display text-4xl sm:text-5xl font-semibold text-[#292725] mb-1 leading-none">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-[#292725] mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-[#7189A5]">
                  {stat.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
