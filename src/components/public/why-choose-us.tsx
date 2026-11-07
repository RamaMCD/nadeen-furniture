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
    title: "Crafted with Passion",
    description:
      "Every piece of Nadeen furniture is meticulously crafted by experienced artisans who take immense pride in their work.",
  },
  {
    icon: Shield,
    title: "Safe for the Whole Family",
    description:
      "Eco-friendly non-toxic finishes, reinforced joinery, and ergonomic contours designed to be safe for children and elders.",
  },
  {
    icon: Leaf,
    title: "Environmentally Conscious",
    description:
      "Sustainably harvested solid timber. We honor natural resources to preserve our environment for generations to come.",
  },
  {
    icon: Ruler,
    title: "Bespoke Customization",
    description:
      "Select your preferred dimensions, timber species, and finishes to harmonize flawlessly with your interior space.",
  },
  {
    icon: Headphones,
    title: "Dedicated Personal Care",
    description:
      "Our design specialists guide you seamlessly from initial aesthetic consultation all the way to white-glove home delivery.",
  },
  {
    icon: Star,
    title: "Uncompromising Quality",
    description:
      "Each finished work undergoes exacting quality assessments before delivery — because your home deserves the absolute best.",
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
              Our Advantages
            </span>
            <span className="h-px w-8 bg-[#C5A46D]" />
          </div>
          <h2 className="font-display text-3xl lg:text-4xl font-medium text-[#292725] leading-tight mb-4">
            Why Discerning Families{" "}
            <span className="text-[#5B473D]">Choose Nadeen?</span>
          </h2>
          <p className="text-[#7189A5] leading-relaxed">
            We craft more than furniture. We bring warmth, timeless serenity, and heirloom-grade artistry designed to enrich your family life for years to come.
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
