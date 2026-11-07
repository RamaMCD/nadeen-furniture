/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        serif: [
          "var(--font-display)",
          "Playfair Display",
          "Georgia",
          "Times New Roman",
          "serif",
        ],
        display: [
          "var(--font-display)",
          "Playfair Display",
          "Georgia",
          "serif",
        ],
      },
      colors: {
        /* ── shadcn/ui system tokens (admin) ──────────────────────────────── */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
        },
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        /* ── Nadeen Furniture brand palette (public pages) — Classic Elegance ── */
        nadeen: {
          "warm-white":     "#FAF8F4",
          "pure-white":     "#FFFFFF",
          "parchment":      "#EEE9E1",
          "border":         "#DDD5C8",
          "champagne-gold": "#C5A46D",
          "dusty-blue":     "#7189A5",
          "deep-blue":      "#40566F",
          "muted-rose-red": "#A65F61",
          "warm-brown":     "#5B473D",
          "soft-charcoal":  "#292725",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        soft: "0 2px 8px -2px rgb(0 0 0 / 0.05), 0 4px 16px -4px rgb(0 0 0 / 0.06)",
        "soft-lg":
          "0 8px 24px -8px rgb(0 0 0 / 0.08), 0 12px 40px -12px rgb(0 0 0 / 0.10)",
        warm: "0 4px 20px -4px rgb(91 71 61 / 0.18)",
        "warm-lg": "0 8px 32px -8px rgb(91 71 61 / 0.22)",
        gold: "0 4px 16px -4px rgb(197 164 109 / 0.25)",
        "gold-lg": "0 8px 28px -8px rgb(197 164 109 / 0.30)",
        blue: "0 4px 16px -4px rgb(64 86 111 / 0.20)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-up": "fade-up 0.7s ease forwards",
        "scale-in": "scale-in 0.6s ease forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
