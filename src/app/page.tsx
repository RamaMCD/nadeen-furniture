/**
 * PUBLIC HOMEPAGE
 * ─────────────────────────────────────────────────────────────
 * Halaman ini mengambil gambar dari database (Admin > Homepage Images)
 * dan meneruskannya ke setiap section.
 *
 * Untuk ganti gambar: Login Admin → Dashboard → Homepage Images
 */

import type { Metadata } from "next";
import { PublicNavbar } from "@/components/public/navbar";
import { HeroSection } from "@/components/public/hero-section";
import { AboutUsSection } from "@/components/public/about-us-section";
import { CompanyIntro } from "@/components/public/company-intro";
import { MaterialGallerySection } from "@/components/public/material-gallery-section";
import { ProcessSection } from "@/components/public/process-section";
import { CatalogCtaSection } from "@/components/public/catalog-cta-section";
import { KidsSection } from "@/components/public/kids-section";
import { getHomepageImages } from "@/lib/db/homepage-images";

export const metadata: Metadata = {
  title: "Nadeen Furniture — Furniture Kayu Solid Berkualitas",
  description:
    "Nadeen Furniture menghadirkan furniture kayu solid berkualitas tinggi yang dibuat dengan keahlian dan penuh cinta.",
  openGraph: {
    title: "Nadeen Furniture — Furniture Kayu Solid Berkualitas",
    description:
      "Nadeen Furniture menghadirkan furniture kayu solid berkualitas tinggi yang dibuat dengan keahlian dan penuh cinta.",
    type: "website",
    locale: "id_ID",
    siteName: "Nadeen Furniture",
  },
};

// Revalidate setiap 60 detik supaya perubahan gambar dari admin langsung terlihat
export const revalidate = 60;

export default async function HomePage() {
  // Ambil gambar dari DB — fallback ke default jika belum diubah
  const images = await getHomepageImages();

  return (
    <>
      <PublicNavbar />
      <main>
        <HeroSection
          heroBg={images.hero}
          heroProduct={images.heroProduct}
        />
        <AboutUsSection image={images.aboutUs} />
        <CompanyIntro
          introMain={images.introMain}
          introLeft={images.introLeft}
          introRight={images.introRight}
        />
        <MaterialGallerySection
          materialGallery1={images.materialGallery1}
          materialGallery2={images.materialGallery2}
          materialGallery3={images.materialGallery3}
        />
        <ProcessSection
          processMaterial={images.processMaterial}
          processLeft={images.processLeft}
          processCenter={images.processCenter}
          processRight={images.processRight}
        />
        <CatalogCtaSection
          catalogFeature={images.catalogFeature}
          catalogFeature2={images.catalogFeature2}
          catalogFeature3={images.catalogFeature3}
          catalogFeature4={images.catalogFeature4}
          catalogFeatureLandscape={images.catalogFeatureLandscape}
          catalogFeature5={images.catalogFeature5}
          catalogFeature6={images.catalogFeature6}
        />
        <KidsSection
          statsMain={images.statsMain}
        />
      </main>
    </>
  );
}
