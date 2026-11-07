import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Eye, Target, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Company — Nadeen Furniture",
  description:
    "Kenali Nadeen Furniture — brand furniture kayu solid Indonesia yang menghadirkan produk berkualitas tinggi dengan penuh keahlian dan cinta.",
};

const TIMELINE = [
  {
    year: "Awal",
    title: "Berdiri",
    desc: "Nadeen Furniture didirikan dengan satu visi: menghadirkan furniture kayu solid berkualitas tinggi yang terjangkau untuk rumah Indonesia.",
  },
  {
    year: "Berkembang",
    title: "Perluasan Koleksi",
    desc: "Koleksi berkembang meliputi ruang tamu, kamar tidur, ruang makan, hingga furniture anak yang aman dan menyenangkan.",
  },
  {
    year: "Inovasi",
    title: "Cat Water-Based",
    desc: "Transisi ke cat water-based non-toxic untuk seluruh lini produk — aman untuk keluarga dan ramah lingkungan.",
  },
  {
    year: "Kini",
    title: "Tumbuh Bersama",
    desc: "Terus bertumbuh dengan melayani pelanggan di seluruh Indonesia melalui platform digital dan showroom.",
  },
];

const VALUES = [
  {
    emoji: "🪵",
    title: "Material Berkualitas",
    desc: "Hanya kayu solid terpilih — jati, mahoni, trembesi — yang lolos seleksi ketat sebelum masuk ke workshop.",
  },
  {
    emoji: "🤲",
    title: "Handcrafted",
    desc: "Setiap produk dikerjakan secara handmade oleh pengrajin berpengalaman dengan perhatian penuh terhadap detail.",
  },
  {
    emoji: "🌱",
    title: "Ramah Lingkungan",
    desc: "Cat water-based bebas bahan kimia berbahaya, aman untuk anak-anak dan lingkungan.",
  },
  {
    emoji: "🏠",
    title: "Untuk Keluarga",
    desc: "Furniture kami dirancang untuk menemani kehidupan keluarga — kuat, tahan lama, dan indah.",
  },
  {
    emoji: "✨",
    title: "Finishing Custom",
    desc: "Tersedia pilihan finishing custom sesuai selera — dari natural wood hingga warna-warna pilihan.",
  },
  {
    emoji: "💬",
    title: "Layanan Personal",
    desc: "Tim kami siap membantu Anda menemukan furniture yang tepat untuk setiap ruangan.",
  },
];

export default function CompanyPage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative pt-32 pb-24 overflow-hidden" style={{ backgroundColor: "#40566F" }}>
        {/* Subtle texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #FAF8F4 0, #FAF8F4 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />
        {/* Soft Sage glow */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[400px] h-[400px] bg-[#DDD5C8]/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <nav className="flex items-center gap-2 text-sm text-[#DDD5C8] mb-10">
            <Link href="/" className="hover:text-[#FAF8F4] transition-colors">Home</Link>
            <span className="text-[#C5A46D]">/</span>
            <span className="text-[#FAF8F4]">Company</span>
          </nav>
          <div className="flex items-center gap-3 mb-5">
            <span className="h-px w-8 bg-[#DDD5C8]" />
            <span className="text-xs font-semibold text-[#DDD5C8] tracking-[0.15em] uppercase">Our Story</span>
          </div>
          <h1 className="font-display text-4xl lg:text-5xl font-medium text-[#FAF8F4] mb-5 leading-tight">
            Nadeen Furniture
          </h1>
          <p className="text-lg text-[#EEE9E1] max-w-2xl leading-relaxed">
            Furniture kayu solid berkualitas tinggi, dibuat dengan keahlian dan
            penuh cinta. Setiap potongan kayu adalah sebuah karya.
          </p>
        </div>
      </div>

      {/* ── About ─────────────────────────────────────────────────────────── */}
      <section id="about" className="py-24" style={{ backgroundColor: "#FAF8F4" }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="h-px w-8 bg-[#C5A46D]" />
                <span className="text-xs font-semibold text-[#C5A46D] tracking-[0.15em] uppercase">
                  Tentang Kami
                </span>
              </div>
              <h2 className="font-display text-3xl font-medium text-[#292725] mb-5">
                Siapa Kami?
              </h2>
              <p className="text-[#7189A5] leading-relaxed mb-5">
                Nadeen Furniture adalah brand furniture kayu solid Indonesia yang
                hadir dengan satu misi: menghadirkan furniture berkualitas tinggi
                yang terjangkau untuk setiap rumah. Kami percaya bahwa keindahan
                sebuah rumah dimulai dari furniture yang tepat.
              </p>
              <p className="text-[#7189A5] leading-relaxed mb-5">
                Setiap produk kami dikerjakan secara handmade oleh pengrajin
                berpengalaman menggunakan kayu solid pilihan. Perhatian kami
                terhadap detail ada di setiap sambungan, setiap permukaan, setiap
                sentuhan akhir.
              </p>
              <p className="text-[#7189A5] leading-relaxed">
                Dari ruang tamu hingga kamar anak, dari material hingga finishing
                — semua dirancang untuk mendukung kehidupan keluarga Anda selama
                bertahun-tahun.
              </p>
            </div>

            {/* Highlights grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "100%", label: "Solid Wood" },
                { value: "Handmade", label: "Craftmanship" },
                { value: "Water-Based", label: "Cat Non-Toxic" },
                { value: "Custom", label: "Pilihan Finishing" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-7 text-center border border-[#DDD5C8] rounded-sm hover:border-[#C5A46D]/50 hover:bg-[#EEE9E1]/60 transition-all"
                >
                  <div className="font-display text-xl lg:text-2xl font-semibold text-[#40566F] mb-1">
                    {item.value}
                  </div>
                  <div className="text-sm text-[#7189A5]">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── History / Timeline ────────────────────────────────────────────── */}
      <section id="history" className="py-24" style={{ backgroundColor: "#EEE9E1" }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="flex items-center justify-center gap-3 mb-5">
              <span className="h-px w-8 bg-[#40566F]" />
              <span className="text-xs font-semibold text-[#40566F] tracking-[0.15em] uppercase">
                Perjalanan Kami
              </span>
              <span className="h-px w-8 bg-[#40566F]" />
            </div>
            <h2 className="font-display text-3xl font-medium text-[#292725]">
              Sejarah & Perkembangan
            </h2>
          </div>

          {/* Mobile: stacked; Desktop: alternating */}
          <div className="relative max-w-4xl mx-auto">
            {/* Center line (desktop) */}
            <div className="absolute left-1/2 -translate-x-px top-5 bottom-5 w-0.5 bg-[#40566F]/20 hidden lg:block" />

            <div className="space-y-6">
              {TIMELINE.map((item, i) => (
                <div
                  key={item.year}
                  className={`flex items-center gap-6 lg:gap-8 ${
                    i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                  }`}
                >
                  {/* Card */}
                  <div className="flex-1">
                    <div
                      className={`bg-white border border-[#DDD5C8] rounded-sm p-6 hover:border-[#C5A46D]/50 hover:shadow-sage transition-all ${
                        i % 2 === 0 ? "lg:text-right" : ""
                      }`}
                    >
                      <span className="inline-block text-xs font-semibold text-[#40566F] bg-[#EEE9E1] border border-[#DDD5C8] px-3 py-1 mb-3 rounded-sm">
                        {item.year}
                      </span>
                      <h3 className="font-semibold text-[#292725] mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-[#7189A5] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  {/* Center dot (desktop) */}
                  <div className="hidden lg:flex w-10 h-10 bg-[#40566F] border-4 border-[#EEE9E1] shadow-lg flex-shrink-0 items-center justify-center z-10 rounded-sm">
                    <div className="w-2 h-2 bg-[#FAF8F4] rounded-full" />
                  </div>

                  {/* Spacer (desktop) */}
                  <div className="flex-1 hidden lg:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Vision & Mission ─────────────────────────────────────────────── */}
      <section id="vision" className="py-24" style={{ backgroundColor: "#FAF8F4" }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="flex items-center justify-center gap-3 mb-5">
              <span className="h-px w-8 bg-[#C5A46D]" />
              <span className="text-xs font-semibold text-[#C5A46D] tracking-[0.15em] uppercase">
                Arah Kami
              </span>
              <span className="h-px w-8 bg-[#C5A46D]" />
            </div>
            <h2 className="font-display text-3xl font-medium text-[#292725]">Visi & Misi</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Vision */}
            <div className="relative p-10 overflow-hidden rounded-sm" style={{ backgroundColor: "#2B3E54" }}>
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#C5A46D]/15 rounded-full blur-3xl" />
              <div className="relative z-10">
                <Eye className="w-10 h-10 mb-5 text-[#DDD5C8]" />
                <h3 className="text-xl font-semibold text-[#FAF8F4] mb-4">Visi</h3>
                <p className="text-[#EEE9E1] leading-relaxed">
                  Menjadi brand furniture kayu solid Indonesia yang paling dicintai
                  — dikenal karena kualitas, keahlian, dan komitmen menghadirkan
                  keindahan ke setiap rumah di Indonesia.
                </p>
              </div>
            </div>

            {/* Mission */}
            <div className="p-10 border border-[#DDD5C8] bg-white rounded-sm">
              <Target className="w-10 h-10 text-[#40566F] mb-5" />
              <h3 className="text-xl font-semibold text-[#292725] mb-5">Misi</h3>
              <ul className="space-y-4">
                {[
                  "Menghadirkan furniture kayu solid berkualitas tinggi dengan harga yang terjangkau",
                  "Menggunakan material ramah lingkungan dan cat water-based non-toxic",
                  "Melatih dan memberdayakan pengrajin lokal berpengalaman",
                  "Memberikan pilihan kustomisasi yang memudahkan pelanggan",
                  "Melayani setiap pelanggan dengan sepenuh hati",
                ].map((m) => (
                  <li key={m} className="flex items-start gap-3 text-sm text-[#7189A5]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#40566F] flex-shrink-0 mt-2" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────────────── */}
      <section id="values" className="py-24" style={{ backgroundColor: "#EEE9E1" }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="flex items-center justify-center gap-3 mb-5">
              <span className="h-px w-8 bg-[#40566F]" />
              <span className="text-xs font-semibold text-[#40566F] tracking-[0.15em] uppercase">
                Nilai Kami
              </span>
              <span className="h-px w-8 bg-[#40566F]" />
            </div>
            <h2 className="font-display text-3xl font-medium text-[#292725]">
              Yang Menjadi Fondasi Kami
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="bg-white border border-[#DDD5C8] rounded-sm p-7 hover:shadow-sage hover:border-[#C5A46D]/50 transition-all group cursor-default"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">
                  {v.emoji}
                </div>
                <h3 className="font-semibold text-[#292725] mb-2">{v.title}</h3>
                <p className="text-sm text-[#7189A5] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-[#DDD5C8]" style={{ backgroundColor: "#FAF8F4" }}>
        <div className="max-w-3xl mx-auto px-5 sm:px-8 lg:px-12 text-center">
          <h2 className="font-display text-3xl font-medium text-[#292725] mb-4">
            Tertarik dengan Koleksi Kami?
          </h2>
          <p className="text-[#7189A5] mb-8 leading-relaxed">
            Jelajahi katalog produk kami atau hubungi tim Nadeen Furniture untuk
            konsultasi dan informasi lebih lanjut.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/catalog"
              id="company-cta-catalog"
              className="inline-flex items-center justify-center gap-2 bg-[#40566F] text-[#FAF8F4] font-semibold px-8 py-4 rounded-sm hover:bg-[#2B3E54] transition-all"
            >
              Lihat Katalog
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://wa.me/6282227798410"
              target="_blank"
              rel="noopener noreferrer"
              id="company-cta-contact"
              className="inline-flex items-center justify-center gap-2 border border-[#DDD5C8] text-[#40566F] font-semibold px-8 py-4 rounded-sm hover:bg-[#EEE9E1] hover:border-[#C5A46D]/50 transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp Kami
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
