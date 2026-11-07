import type { Metadata } from "next";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";

export const metadata: Metadata = {
  title: {
    template: "%s | Nadeen Furniture",
    default: "Nadeen Furniture — Handcrafted Solid Wood Furniture",
  },
  description:
    "Explore timeless European-inspired solid wood furniture handcrafted with master artisan dedication.",
};

/**
 * Shared layout for all public-facing pages under (public)/.
 * Wraps each page with the PublicNavbar and PublicFooter.
 *
 * Note: The root homepage (/) is handled by src/app/page.tsx directly
 * and includes the same Navbar/Footer components without this layout.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicNavbar />
      <main className="min-h-screen">{children}</main>
      <PublicFooter />
    </>
  );
}
