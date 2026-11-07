"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X } from "lucide-react";

const LEFT_LINKS = [
  { href: "/catalog", label: "Catalog" },
];
const RIGHT_LINKS = [
  { href: "/#contact", label: "Contact" },
];

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Handle cross-page or direct hash scrolling to #contact
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#contact") {
      const el = document.getElementById("contact");
      if (el) {
        const timer = setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [pathname]);

  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      const el = document.getElementById("contact");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", "#contact");
      }
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? "backdrop-blur-md" : ""
        }`}
        style={{ backgroundColor: "#F8F6F0", borderBottom: "1px solid #E5E0D8" }}
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="relative flex items-center h-14">

            {/* Left nav */}
            <nav className="hidden lg:flex items-center gap-8 flex-1">
              {LEFT_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`text-xs font-medium tracking-wider uppercase transition-colors ${
                    pathname.startsWith(l.href)
                      ? "text-[#1a1a18]"
                      : "text-[#8a847c] hover:text-[#1a1a18]"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Center logo */}
            <Link
              href="/"
              className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center py-1 group"
            >
              <Image
                src="/images/logo-nav.png"
                alt="Nadeen"
                width={120}
                height={42}
                className="h-9 w-auto object-contain transition-opacity group-hover:opacity-80"
                priority
              />
            </Link>

            {/* Right nav */}
            <nav className="hidden lg:flex items-center gap-8 flex-1 justify-end">
              {RIGHT_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={l.href === "/#contact" ? handleContactClick : undefined}
                  className="text-xs font-medium tracking-wider uppercase transition-colors text-[#8a847c] hover:text-[#1a1a18]"
                >
                  {l.label}
                </Link>
              ))}
              <div className="flex items-center gap-4 ml-4">
                <Link
                  href="/catalog"
                  className="transition-colors hover:text-[#1a1a18]"
                  style={{ color: "#8a847c" }}
                  aria-label="Cart"
                >
                  <ShoppingBag size={16} />
                </Link>
              </div>
            </nav>

            {/* Mobile hamburger */}
            <div className="lg:hidden flex items-center gap-4 ml-auto">
              <button
                onClick={() => setOpen((p) => !p)}
                className="hover:text-[#1a1a18] transition-colors"
                style={{ color: "#8a847c" }}
                aria-label="Menu"
              >
                {open ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {open && (
          <div
            className="lg:hidden border-t px-6 py-6 flex flex-col gap-5"
            style={{ backgroundColor: "#F8F6F0", borderColor: "#E5E0D8" }}
          >
            {[...LEFT_LINKS, ...RIGHT_LINKS].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={(e) => {
                  setOpen(false);
                  if (l.href === "/#contact") {
                    handleContactClick(e);
                  }
                }}
                className={`text-sm uppercase tracking-wider transition-colors ${
                  l.href !== "/#contact" && pathname.startsWith(l.href)
                    ? "text-[#1a1a18] font-semibold"
                    : "text-[#8a847c] hover:text-[#1a1a18]"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </header>
    </>
  );
}
