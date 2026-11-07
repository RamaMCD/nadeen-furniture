import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Eye, Target, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Company — Nadeen Furniture",
  description:
    "Discover Nadeen Furniture — an Indonesian handcrafted solid wood furniture maker delivering premium European-inspired collections with passion and master craftsmanship.",
};

const TIMELINE = [
  {
    year: "Inception",
    title: "Founded",
    desc: "Nadeen Furniture was founded with a singular purpose: to deliver heirloom-quality solid wood furniture with timeless aesthetic appeal.",
  },
  {
    year: "Expansion",
    title: "Collection Growth",
    desc: "Our catalog expanded across living rooms, bedrooms, and dining spaces to bespoke children's pieces crafted with safety and warmth.",
  },
  {
    year: "Innovation",
    title: "Eco-Friendly Finishes",
    desc: "Pioneered the transition to non-toxic, water-based finishes across our entire product line — safe for families and kind to our planet.",
  },
  {
    year: "Today",
    title: "Flourishing Together",
    desc: "Continuing our heritage of excellence, delivering bespoke handcrafted creations to discerning homes through digital experiences and our workshop.",
  },
];

const VALUES = [
  {
    emoji: "🪵",
    title: "Finest Timber",
    desc: "Only hand-selected solid hardwoods — teak, mahogany, and suar — pass our rigorous standards before arriving in our workshop.",
  },
  {
    emoji: "🤲",
    title: "Handcrafted Artistry",
    desc: "Every creation is hand-formed by generational artisans who pour their dedication into every contour and dovetail joint.",
  },
  {
    emoji: "🌱",
    title: "Eco-Conscious",
    desc: "Utilizing sustainably harvested timbers and non-toxic finishes, preserving the environment for future generations.",
  },
  {
    emoji: "🏠",
    title: "Built for Family Life",
    desc: "Our furniture is designed to stand the test of time — resilient, enduring, and gracefully aging with your home.",
  },
  {
    emoji: "✨",
    title: "Bespoke Finishing",
    desc: "Tailored stain and finishing options to complement your interior palette — from warm natural grains to signature hues.",
  },
  {
    emoji: "💬",
    title: "Dedicated Service",
    desc: "Our design team is devoted to helping you curate and customize the ideal pieces for every room in your home.",
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
            High-grade solid wood furniture, sculpted with master craftsmanship and heartfelt passion. Every piece of timber tells an enduring story.
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
                  About Us
                </span>
              </div>
              <h2 className="font-display text-3xl font-medium text-[#292725] mb-5">
                Who We Are
              </h2>
              <p className="text-[#7189A5] leading-relaxed mb-5">
                Nadeen Furniture is an Indonesian solid wood furniture house inspired by classic European grace. We believe that true home elegance begins with honest materials and dedicated craftsmanship.
              </p>
              <p className="text-[#7189A5] leading-relaxed mb-5">
                Every single piece in our collection is carefully handcrafted by seasoned woodworkers. Our uncompromising attention to detail shines through in every joint, curved contour, and hand-rubbed finish.
              </p>
              <p className="text-[#7189A5] leading-relaxed">
                From living rooms to children’s sanctuaries, our furniture is designed to enrich your family life with enduring warmth and timeless prestige.
              </p>
            </div>

            {/* Highlights grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "100%", label: "Solid Wood" },
                { value: "Handmade", label: "Artisan Craftsmanship" },
                { value: "Water-Based", label: "Non-Toxic Finishes" },
                { value: "Bespoke", label: "Custom Tailoring" },
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
                Our Journey
              </span>
              <span className="h-px w-8 bg-[#40566F]" />
            </div>
            <h2 className="font-display text-3xl font-medium text-[#292725]">
              Heritage & Evolution
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
                Our Purpose
              </span>
              <span className="h-px w-8 bg-[#C5A46D]" />
            </div>
            <h2 className="font-display text-3xl font-medium text-[#292725]">Vision & Mission</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Vision */}
            <div className="relative p-10 overflow-hidden rounded-sm" style={{ backgroundColor: "#2B3E54" }}>
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#C5A46D]/15 rounded-full blur-3xl" />
              <div className="relative z-10">
                <Eye className="w-10 h-10 mb-5 text-[#DDD5C8]" />
                <h3 className="text-xl font-semibold text-[#FAF8F4] mb-4">Vision</h3>
                <p className="text-[#EEE9E1] leading-relaxed">
                  To be the most admired handcrafted solid wood furniture brand — celebrated globally for authentic artistry, uncompromising quality, and enduring natural elegance.
                </p>
              </div>
            </div>

            {/* Mission */}
            <div className="p-10 border border-[#DDD5C8] bg-white rounded-sm">
              <Target className="w-10 h-10 text-[#40566F] mb-5" />
              <h3 className="text-xl font-semibold text-[#292725] mb-5">Mission</h3>
              <ul className="space-y-4">
                {[
                  "Deliver heirloom-grade solid wood furniture crafted for generations of longevity",
                  "Utilize sustainably sourced timber and eco-friendly non-toxic finishes",
                  "Empower and honor generational master woodworkers and artisans",
                  "Offer flexible bespoke options tailored to client aspirations",
                  "Serve every home with heartfelt dedication and personal care",
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
                Our Values
              </span>
              <span className="h-px w-8 bg-[#40566F]" />
            </div>
            <h2 className="font-display text-3xl font-medium text-[#292725]">
              The Pillars of Our Craft
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
            Interested in Our Collections?
          </h2>
          <p className="text-[#7189A5] mb-8 leading-relaxed">
            Explore our curated catalog or reach out to our artisans for personalized design consultations and custom commissions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/catalog"
              id="company-cta-catalog"
              className="inline-flex items-center justify-center gap-2 bg-[#40566F] text-[#FAF8F4] font-semibold px-8 py-4 rounded-sm hover:bg-[#2B3E54] transition-all"
            >
              Explore Catalog
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://wa.me/6285113072901"
              target="_blank"
              rel="noopener noreferrer"
              id="company-cta-contact"
              className="inline-flex items-center justify-center gap-2 border border-[#DDD5C8] text-[#40566F] font-semibold px-8 py-4 rounded-sm hover:bg-[#EEE9E1] hover:border-[#C5A46D]/50 transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
