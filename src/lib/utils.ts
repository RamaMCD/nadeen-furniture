import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a numeric price to Indonesian Rupiah currency format.
 * Example: 4500000 -> "Rp 4.500.000"
 */
export function formatRupiah(amount?: number | null): string {
  if (amount == null || isNaN(amount) || amount <= 0) {
    return "Price on request";
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace(/\s/g, " ");
}
