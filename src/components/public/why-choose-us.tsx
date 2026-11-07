import {
  Heart,
  Leaf,
  Ruler,
  Headphones,
  Shield,
  Star,
} from "lucide-react";

const REASONS = [
  {
    icon: Heart,
    title: "Dibuat dengan Cinta",
    description:
      "Setiap furniture Nadeen dikerjakan dengan hati oleh pengrajin berpengalaman yang mencintai pekerjaannya.",
  },
  {
    icon: Shield,
    title: "Aman untuk Keluarga",
    description:
      "Cat water-based non-toxic, sambungan yang kuat, dan desain ergonomis yang aman untuk anak-anak dan lansia.",
  },
  {
    icon: Leaf,
    title: "Ramah Lingkungan",
    description:
      "Kayu solid dari sumber berkelanjutan. Kami peduli pada lingkungan agar alam tetap lestari untuk generasi mendatang.",
  },
  {
    icon: Ruler,
    title: "Custom Sesuai Selera",
    description:
      "Tersedia pilihan ukuran, warna, dan finishing yang bisa disesuaikan dengan kebutuhan dan dimensi ruang Anda.",
  },
  {
    icon: Headphones,
    title: "Layanan Personal",
    description:
      "Tim kami siap membantu Anda dari konsultasi desain hingga pengiriman ke rumah dengan layanan yang hangat.",
  },
  {
    icon: Star,
    title: "Kualitas Terjamin",
    description:
      "Setiap produk melalui quality control ketat sebelum sampai ke tangan Anda — karena Anda layak mendapat yang terbaik.",
  },
];

/* ─── Section background: Warm White #FAF8F4 — Classic Elegance palette ─────── */
export function WhyChooseUs() {
  return (
    <section id="why-choose-us" className="py-24 lg:py-32" style={{ backgroundColor: "#FAF8F4" }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="h-px w-8 bg-[#C5A46D]" />
            <span className="text-xs font-semibold text-[#C5A46D] tracking-[0.15em] uppercase">
              Keunggulan Kami
            </span>
            <span className="h-px w-8 bg-[#C5A46D]" />
          </div>
          <h2 className="font-display text-3xl lg:text-4xl font-medium text-[#292725] leading-tight mb-4">
            Mengapa Keluarga{" "}
            <span className="text-[#5B473D]">Memilih Nadeen?</span>
          </h2>
          <p className="text-[#7189A5] leading-relaxed">
            Kami bukan sekadar menjual furniture. Kami menghadirkan kenyamanan,
            keamanan, dan keindahan yang akan menemani keluarga Anda bertahun-tahun.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {REASONS.map((reason) => {
            const Icon = reason.icon;
            return (
              <div
                key={reason.title}
                className="group p-7 rounded-sm border border-[#DDD5C8] bg-white hover:border-[#C5A46D]/50 hover:shadow-warm transition-all duration-300 cursor-default"
              >
                {/* Icon */}
                <div className="w-11 h-11 rounded-sm bg-[#EEE9E1] flex items-center justify-center mb-5 group-hover:bg-[#C5A46D]/15 transition-all duration-300">
                  <Icon className="w-5 h-5 text-[#40566F] group-hover:text-[#C5A46D] transition-colors duration-300" />
                </div>

                <h3 className="font-semibold text-[#292725] text-[1.0rem] mb-2">
                  {reason.title}
                </h3>
                <p className="text-sm text-[#7189A5] leading-relaxed">
                  {reason.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
