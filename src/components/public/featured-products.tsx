import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getFeaturedProducts } from "@/lib/db/public-products";
import { ProductCard } from "./product-card";

/**
 * Server Component — fetches featured published products and renders them.
 * Returns null silently if no products are published or on fetch error.
 *
 * Section background: Warm White #FAF8F4
 */
export async function FeaturedProducts() {
  let products: Awaited<ReturnType<typeof getFeaturedProducts>> = [];

  try {
    products = await getFeaturedProducts(6);
  } catch {
    // Don't crash the page if the catalog isn't available yet
    return null;
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section id="featured-products" className="py-28 lg:py-40" style={{ backgroundColor: "#111111" }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-[#C9A96E]" />
              <span className="text-xs text-[#C9A96E] tracking-[0.2em] uppercase">
                Our Collection
              </span>
            </div>
            <h2 className="font-display text-3xl lg:text-4xl font-medium text-[#F5F0E8] leading-tight">
              Featured Products
            </h2>
          </div>
          <Link
            href="/catalog"
            id="featured-products-view-all"
            className="inline-flex items-center gap-2 text-xs tracking-[0.12em] uppercase text-[#C9A96E] flex-shrink-0 group hover:text-[#E2C992] transition-colors"
          >
            View All
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Product grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} variant="dark" />
          ))}
        </div>

        {/* View all CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 border border-[#2A2A2A] text-[#A8A090] text-xs tracking-[0.12em] uppercase px-8 py-4 hover:border-[#C9A96E]/40 hover:text-[#C9A96E] transition-all duration-300"
          >
            Explore Full Collection
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
