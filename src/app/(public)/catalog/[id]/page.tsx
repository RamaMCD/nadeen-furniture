import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedProductById } from "@/lib/db/public-products";
import { CONTENT } from "@/lib/site-config";
import { ProductDetailClient } from "@/components/public/product-detail-client";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await getPublishedProductById(id);
    if (!product) return { title: "Product Not Found — Nadeen Furniture" };
    return {
      title: `${product.name} — Nadeen Furniture`,
      description:
        product.description ??
        `Explore ${product.name} from Nadeen Furniture's handcrafted solid wood collection.`,
    };
  } catch {
    return { title: "Product — Nadeen Furniture" };
  }
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;

  let product = null;
  try {
    product = await getPublishedProductById(id);
  } catch {
    // network/DB error — treated as not found
  }

  if (!product) {
    notFound();
  }

  const categoryName = product.categories?.name ?? "Furniture";

  // Build WhatsApp URL from site config
  const waBase = CONTENT.contact.whatsapp; // "https://wa.me/6285113072901"
  const waText = encodeURIComponent(
    `Halo Nadeen Furniture, saya tertarik dengan produk *${product.name}*. Bisa minta informasi lebih lanjut?`
  );
  const whatsappUrl = `${waBase}?text=${waText}`;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF8F4" }}>
      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <div className="pt-24 bg-white border-b border-[#E5E0D8]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-4">
          <nav
            className="flex items-center gap-2 text-xs sm:text-sm text-[#7189A5]"
            aria-label="Breadcrumb"
          >
            <Link
              href="/"
              className="hover:text-[#40566F] transition-colors whitespace-nowrap"
            >
              Home
            </Link>
            <span className="text-[#C8C0B4] select-none">/</span>
            <Link
              href="/catalog"
              className="hover:text-[#40566F] transition-colors whitespace-nowrap"
            >
              Product Catalog
            </Link>
            <span className="text-[#C8C0B4] select-none">/</span>
            <span className="text-[#292725] font-medium truncate max-w-[180px] sm:max-w-xs">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 lg:py-16">
        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[55%_1fr] gap-10 lg:gap-16 xl:gap-20">
          {/* ── LEFT: Image Gallery ──────────────────────────────────────────── */}
          <ProductDetailClient
            imageUrl={product.image_url}
            productName={product.name}
          />

          {/* ── RIGHT: Product Information ───────────────────────────────────── */}
          <div className="flex flex-col">
            {/* Category label */}
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#7189A5] mb-3">
              {categoryName}
            </p>

            {/* Product name */}
            <h1 className="font-display text-3xl sm:text-4xl font-medium leading-tight text-[#292725] mb-6">
              {product.name}
            </h1>

            {/* Divider */}
            <div className="h-px bg-[#E5E0D8] mb-6" />

            {/* Description */}
            {product.description && (
              <div className="mb-7">
                <h2 className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#C5A46D] mb-3">
                  About This Piece
                </h2>
                <p className="text-[#5B473D] text-sm sm:text-[15px] leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Specifications */}
            {product.specifications && (
              <SpecificationsBlock raw={product.specifications} />
            )}

            {/* Fallback if no description and no specs */}
            {!product.description && !product.specifications && (
              <p className="text-sm text-[#7189A5] italic mb-6">
                Contact us for detailed information on this piece.
              </p>
            )}

            {/* Spacer pushes CTA to bottom on tall screens */}
            <div className="flex-1 min-h-[2rem]" />

            {/* Divider */}
            <div className="h-px bg-[#E5E0D8] mb-6" />

            {/* WhatsApp CTA */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-[#40566F] text-white font-semibold text-sm tracking-[0.08em] uppercase rounded-sm hover:bg-[#2B3E54] transition-colors duration-200 shadow-sm mb-4"
            >
              {/* WhatsApp icon (inline SVG for no-extra-dep) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 shrink-0"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.112.552 4.1 1.512 5.831L0 24l6.336-1.482A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.806 9.806 0 01-5.034-1.386l-.361-.214-3.741.875.936-3.635-.235-.375A9.808 9.808 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
              </svg>
              Inquire About This Product
            </a>

            {/* Back to catalog */}
            <Link
              href="/catalog"
              className="flex items-center justify-center gap-2 text-sm text-[#7189A5] hover:text-[#40566F] transition-colors py-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Catalog
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Specifications renderer ───────────────────────────────────────────────────

/**
 * Renders the raw `specifications` text as a styled key-value table when the
 * content follows "KEY: value" lines, or as a plain styled block otherwise.
 */
function SpecificationsBlock({ raw }: { readonly raw: string }) {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // Try to parse as key: value pairs
  const pairs: { key: string; value: string }[] = [];
  const unstructured: string[] = [];

  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx > 0 && colonIdx < 30) {
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();
      if (key && value) {
        pairs.push({ key, value });
        continue;
      }
    }
    unstructured.push(line);
  }

  const hasStructured = pairs.length > 0;

  return (
    <div className="mb-7">
      <h2 className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#C5A46D] mb-3">
        Specifications
      </h2>

      {hasStructured && (
        <dl className="border border-[#E5E0D8] rounded-sm overflow-hidden text-sm">
          {pairs.map(({ key, value }, i) => (
            <div
              key={key}
              className={`flex ${i % 2 === 0 ? "bg-white" : "bg-[#FAF8F4]"}`}
            >
              <dt className="w-[42%] shrink-0 px-4 py-3 font-semibold text-[#40566F] uppercase tracking-wide text-[11px] border-r border-[#E5E0D8]">
                {key}
              </dt>
              <dd className="px-4 py-3 text-[#5B473D] leading-relaxed">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {unstructured.length > 0 && (
        <div
          className={`${hasStructured ? "mt-3" : ""} bg-[#FAF8F4] border border-[#E5E0D8] rounded-sm px-4 py-3 text-sm text-[#5B473D] leading-relaxed whitespace-pre-wrap`}
        >
          {unstructured.join("\n")}
        </div>
      )}
    </div>
  );
}
