/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║              SITE CONFIG — NADEEN FURNITURE                  ║
 * ║  Edit semua teks, warna, dan gambar website di sini          ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * FILE INI ADALAH PUSAT KONFIGURASI WEBSITE PUBLIK.
 * Untuk edit:
 *   - Warna  → bagian COLORS
 *   - Teks   → bagian CONTENT (per section)
 *   - Gambar → bagian IMAGES (bisa juga diubah via Admin > Homepage Images)
 */

// ─────────────────────────────────────────────────────────────────────────────
// COLORS — Ubah warna utama website di sini
// ─────────────────────────────────────────────────────────────────────────────
export const COLORS = {
  /** Warna background utama (krem) */
  pageBg: "#F8F6F0",

  /** Warna background section gelap (hitam elegan) */
  pageDark: "#1a1a18",

  /** Warna background section mid (krem sedikit lebih gelap) */
  sectionAlt: "#F0EDE6",

  /** Warna border/garis pemisah di background terang */
  border: "#E5E0D8",
  borderMid: "#D8D2C8",
  borderLight: "#C8C0B4",

  /** Warna border di background gelap */
  borderDark: "#2a2a28",

  /** Warna teks utama di background terang */
  textPrimary: "#1a1a18",

  /** Warna teks sekunder di background terang */
  textSecondary: "#5a5650",

  /** Warna teks redup di background terang */
  textMuted: "#8a847c",

  /** Warna teks sangat redup */
  textFaint: "#a8a29a",

  /** Warna teks utama di background gelap */
  textOnDark: "#F8F6F0",

  /** Warna teks sekunder di background gelap */
  textOnDarkMuted: "#8a847c",

  /** Warna aksen gold */
  gold: "#c9a96e",

  /** Warna tombol di background terang */
  btnPrimaryBg: "#1a1a18",
  btnPrimaryText: "#F8F6F0",

  /** Warna tombol di background gelap */
  btnOnDarkBg: "#F8F6F0",
  btnOnDarkText: "#1a1a18",

  /** Announcement bar */
  announcementBg: "#EDE8DF",
  announcementText: "#8a847c",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// IMAGES — Gambar default homepage
// Gambar ini bisa diubah via Admin > Homepage Images
// Path: /images/... untuk gambar lokal, atau URL lengkap untuk gambar external
// ─────────────────────────────────────────────────────────────────────────────
export const DEFAULT_IMAGES = {
  /** Hero section — gambar background utama */
  hero: "/images/hero-living-room.jpg",

  /** Company intro — foto besar atas */
  introMain: "/images/hero-living-room.jpg",

  /** Company intro — foto kiri bawah */
  introLeft: "/images/craftsmanship.jpg",

  /** Company intro — foto kanan bawah */
  introRight: "/images/catalog-cta-bg.jpg",

  /** About Us section on homepage */
  aboutUs: "/images/craftsmanship.jpg",

  /** Process section — foto besar material */
  processMaterial: "/images/craftsmanship.jpg",

  /** Process section — foto kiri */
  processLeft: "/images/hero-living-room.jpg",

  /** Process section — foto tengah */
  processCenter: "/images/craftsmanship.jpg",

  /** Process section — foto kanan */
  processRight: "/images/catalog-cta-bg.jpg",

  /** Galeri material — foto portrait sebelum section Kenali Produk */
  materialGallery1: "/images/craftsmanship.jpg",
  materialGallery2: "/images/hero-living-room.jpg",
  materialGallery3: "/images/catalog-cta-bg.jpg",

  /** Catalog CTA — foto featured product */
  catalogFeature: "/images/catalog-cta-bg.jpg",
  catalogFeature2: "/images/hero-living-room.jpg",
  catalogFeature3: "/images/craftsmanship.jpg",
  catalogFeature4: "/images/catalog-cta-bg.jpg",
  catalogFeatureLandscape: "/images/hero-living-room.jpg",
  catalogFeature5: "/images/craftsmanship.jpg",
  catalogFeature6: "/images/catalog-cta-bg.jpg",

  /** Hero — foto produk kecil overlapping teks */
  heroProduct: "/images/craftsmanship.jpg",

  /** Kids/Stats section — foto utama */
  statsMain: "/images/hero-living-room.jpg",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT — Semua teks website per section
// ─────────────────────────────────────────────────────────────────────────────
export const CONTENT = {

  // ── Announcement Bar (pita atas navbar) ──────────────────────────────────
  announcement: "Handmade solid wood furniture — free consultation via WhatsApp",

  // ── Navbar ───────────────────────────────────────────────────────────────
  brand: "NADEEN",

  // ── Hero Section ─────────────────────────────────────────────────────────
  hero: {
    eyebrow: "",
    title: "NADEEN",
    subtitle: "Premium Art",
    ctaLabel: "Explore Collection",
    ctaHref: "/catalog",
    tagline: "",
  },

  // ── Company Intro (Uniqueness & Quality) ─────────────────────────────────
  intro: {
    title: "DETAILED\nAND QUALITY",
    directoryLabel: "Go to the directory",
    descLeft:
      "Every detail contributes to the character of our furniture. From the graceful curves and decorative accents to the choice of fabrics and finishes, we pay close attention to the elements that give each design its distinctive look. It is this attention to detail that defines the character of Nadeen Furniture.",
    descRight:
      "We believe that beautiful furniture begins with quality materials and careful workmanship. Every choice, from the materials used to the finishing touches, plays a part in the overall look and feel of a piece. Our aim is to offer classic furniture that reflects our commitment to quality, design, and lasting appeal.",
    imageCaption: "A rich handcrafted furniture that penetrates to improve your home quality and durability.",
    imageBrand: "BY\nNADEEN",
  },

  // ── Process Section (Kenali Produk) ──────────────────────────────────────
  process: {
    title: "Attention to Detail",
    subtitle:
      "We focus on material selection, colour combinations, and finishing to bring out the character of each design.",
    bodyText:
      "From the furniture's shape to its decorative details, we pay attention to how each element comes together to create a cohesive and elegant look.",
    quote: "A closer look at classic design and its finer details.",
  },

  // ── Catalog CTA (Lihat Lebih Dekat) ──────────────────────────────────────
  catalogCta: {
    sectionTitle: "Look Closer",
    badgeLabel: "Our Finest Collection",
    productLabel: "New",
    productName: "Nadeen Collection",
    productSub: "Solid Teak Wood",
    ctaLabel: "Explore Collection",
    browseLabel: "Browse",
  },

  // ── Stats/Kids Section ────────────────────────────────────────────────────
  stats: {
    title: "Excellence in\nevery home.",
    subtitle:
      "Hundreds of families trust Nadeen for their home elegance. Our pieces can be ordered online or experienced directly at our workshop.",
    stat1Value: "500+",
    stat1Label: "products available in catalog",
    stat2Value: "20+",
    stat2Label: "years of artisan craftsmanship",
    featureTitle: "Add a warm touch for maximum comfort and lasting beauty",
    featureDesc1:
      "Premium furniture designed to provide exceptional durability.",
    featureDesc2:
      "Our solid wood furniture is crafted to accompany your family for generations.",
  },

  // ── Customer Reviews ─────────────────────────────────────────────────────
  reviews: {
    sectionTitle: "Customer Reviews",
    items: [
      {
        title: "Outstanding quality, WOW",
        body: "Nadeen Furniture completely transformed my living room. The solid wood is remarkably premium and built to last.",
      },
      {
        title: "After 1 month, still flawless.",
        body: "Fast delivery, secure packaging, and craftsmanship that exceeded expectations. Will definitely order again.",
      },
      {
        title: "Exceptional value and quality.",
        body: "The Nadeen team was remarkably helpful in finding the ideal pieces to fit my vision without compromise.",
      },
      {
        title: "Seamless and prompt delivery.",
        body: "Ordered smoothly, arrived right on schedule. Highly satisfying experience and the furniture is breathtaking.",
      },
    ],
  },

  // ── Footer ───────────────────────────────────────────────────────────────
  footer: {
    brandName: "Nadeen",
    copyright: "Nadeen Furniture. All rights reserved.",
    exploreLinks: [
      { href: "/catalog", label: "Explore All Products" },
      { href: "/catalog?cat=ruang-tamu", label: "Living Room" },
      { href: "/catalog?cat=kamar-tidur", label: "Bedroom" },
      { href: "/catalog?cat=ruang-makan", label: "Dining Room" },
      { href: "/catalog?cat=kids", label: "Kids Collection" },
      { href: "/catalog?cat=custom", label: "Custom Orders" },
    ],
    productLinks: [
      { href: "/catalog", label: "Dining Tables" },
      { href: "/catalog", label: "Sofas & Chairs" },
      { href: "/catalog", label: "Wardrobes" },
      { href: "/catalog", label: "Beds" },
      { href: "/catalog", label: "Bookshelves" },
      { href: "/catalog", label: "Work Desks" },
    ],
    supportLinks: [
      { href: "/#contact", label: "Contact Us" },
      { href: "https://wa.me/6285113072901", label: "WhatsApp" },
      { href: "/company", label: "About Our Brand" },
      { href: "/catalog", label: "Online Catalog" },
      { href: "/#contact", label: "Custom Commission" },
      { href: "/company#values", label: "Our Values" },
    ],
  },

  // ── Kontak ───────────────────────────────────────────────────────────────
  contact: {
    whatsapp: "https://wa.me/6285113072901",
    whatsappDisplay: "+62 851-1307-2901",
    instagram: "https://www.instagram.com/nadeen_furniture",
    instagramHandle: "@nadeen_furniture",
    linktree: "https://linktr.ee/Nadeen.Furniture",
    linktreeDisplay: "linktr.ee/Nadeen.Furniture",
    address: "9P83+FVP, Jokosari, Ngabul, Kec. Tahunan, Kabupaten Jepara, Jawa Tengah 59428, Indonesia",
    googleMaps: "https://www.google.com/maps/search/?api=1&query=9P83%2BFVP%2C+Jokosari%2C+Ngabul%2C+Kec.+Tahunan%2C+Kabupaten+Jepara%2C+Jawa+Tengah+59428%2C+Indonesia",
    email: "info@nadeenfurniture.com",
    phone: "+62 851-1307-2901",
  },
} as const;
