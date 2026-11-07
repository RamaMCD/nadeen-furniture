import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Package,
  ArrowLeft,
  MessageCircle,
  FileText,
} from "lucide-react";
import { getPublishedProductById } from "@/lib/db/public-products";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await getPublishedProductById(id);
    if (!product) return { title: "Produk Tidak Ditemukan" };
    return {
      title: `${product.name} — Nadeen Furniture`,
      description:
        product.description ??
        `Detail produk ${product.name} (${product.product_code}) dari Nadeen Furniture.`,
    };
  } catch {
    return { title: "Produk" };
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
  const whatsappText = encodeURIComponent(
    `Halo Nadeen Furniture, saya tertarik dengan produk *${product.name}* (Kode: ${product.product_code}). Bisakah saya mendapatkan informasi lebih lanjut?`
  );

  return (
    <>
      {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
      <div className="pt-24 pb-0 bg-white border-b border-[#DDD5C8]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-4">
          <nav className="flex items-center gap-2 text-sm text-[#7189A5]">
            <Link href="/" className="hover:text-[#40566F] transition-colors">
              Home
            </Link>
            <span className="text-[#DDD5C8]">/</span>
            <Link
              href="/catalog"
              className="hover:text-[#40566F] transition-colors"
            >
              Catalog
            </Link>
            <span className="text-[#DDD5C8]">/</span>
            <span className="text-[#292725] font-medium truncate max-w-[200px]">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="py-10 min-h-[60vh]" style={{ backgroundColor: "#EEE9E1" }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          {/* Back link */}
          <Link
            href="/catalog"
            id="product-detail-back"
            className="inline-flex items-center gap-2 text-sm text-[#40566F] hover:text-[#2B3E54] transition-colors mb-8 group font-medium"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Katalog
          </Link>

          {/* Product card */}
          <div className="bg-white border border-[#DDD5C8] rounded-sm shadow-sm overflow-hidden">
            <div className="grid lg:grid-cols-2">
              {/* ── Image ─────────────────────────────────────────────── */}
              <div
                className="relative min-h-[320px] lg:min-h-[520px]"
                style={{ backgroundColor: "#FAF8F4" }}
              >
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                    quality={85}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <Package className="w-20 h-20 text-[#7189A5]/40" />
                    <p className="text-sm text-[#7189A5]">
                      Gambar tidak tersedia
                    </p>
                  </div>
                )}

                {/* Category badge */}
                <div className="absolute top-4 left-4">
                  <span className="text-[10px] font-semibold tracking-[0.1em] uppercase bg-[#292725]/75 text-[#DDD5C8] px-3 py-1.5 backdrop-blur-sm rounded-sm">
                    {categoryName}
                  </span>
                </div>
              </div>

              {/* ── Details ───────────────────────────────────────────── */}
              <div className="p-8 lg:p-12 flex flex-col">
                {/* Name */}
                <h1 className="font-display text-2xl lg:text-3xl font-medium text-[#292725] mb-3 leading-snug">
                  {product.name}
                </h1>

                {/* Product code */}
                <div className="inline-flex items-center gap-2 bg-[#FAF8F4] border border-[#DDD5C8] px-3 py-1.5 mb-6 self-start rounded-sm">
                  <FileText className="w-3.5 h-3.5 text-[#7189A5]" />
                  <span className="text-xs text-[#40566F] font-mono">
                    {product.product_code}
                  </span>
                </div>

                <div className="border-t border-[#DDD5C8] mb-6" />

                {/* Description */}
                {product.description ? (
                  <div className="mb-6">
                    <h2 className="text-xs font-semibold text-[#7189A5] uppercase tracking-[0.1em] mb-3">
                      Deskripsi Produk
                    </h2>
                    <p className="text-[#40566F] text-sm leading-relaxed whitespace-pre-wrap">
                      {product.description}
                    </p>
                  </div>
                ) : null}

                {/* Specifications */}
                {product.specifications ? (
                  <div className="mb-6">
                    <h2 className="text-xs font-semibold text-[#7189A5] uppercase tracking-[0.1em] mb-3">
                      Spesifikasi
                    </h2>
                    <div className="bg-[#FAF8F4] border border-[#DDD5C8] p-5 text-xs text-[#40566F] font-mono whitespace-pre-wrap leading-relaxed rounded-sm">
                      {product.specifications}
                    </div>
                  </div>
                ) : null}

                {/* No description/specs fallback */}
                {!product.description && !product.specifications && (
                  <p className="text-sm text-[#7189A5] italic mb-6">
                    Hubungi kami untuk informasi detail produk ini.
                  </p>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Contact CTAs */}
                <div className="space-y-3 pt-4 border-t border-[#DDD5C8]">
                  <a
                    href={`https://wa.me/6282227798410?text=${whatsappText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    id="product-detail-whatsapp"
                    className="flex items-center justify-center gap-2.5 w-full bg-[#C5A46D] text-[#FFFFFF] font-semibold py-4 hover:bg-[#40566F] transition-all text-sm tracking-wide rounded-sm shadow-sm"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Tanya via WhatsApp
                  </a>
                  <a
                    href="https://wa.me/6282227798410"
                    target="_blank"
                    rel="noopener noreferrer"
                    id="product-detail-contact"
                    className="flex items-center justify-center gap-2.5 w-full border border-[#DDD5C8] text-[#40566F] font-semibold py-4 hover:bg-[#FAF8F4] transition-colors text-sm rounded-sm"
                  >
                    Hubungi Nadeen Furniture
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Related link */}
          <div className="mt-8 text-center">
            <Link
              href="/catalog"
              className="text-sm text-[#7189A5] hover:text-[#40566F] transition-colors"
            >
              ← Lihat produk lainnya di katalog
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
