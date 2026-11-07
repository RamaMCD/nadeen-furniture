"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  ExternalLink,
  Tag,
  Barcode,
  Hash,
  Calendar,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProductWithCategory } from "@/lib/db/products";

// ─── Constants ───────────────────────────────────────────────────────────────

/** Units at or below this threshold are considered "Low Stock". */
const LOW_STOCK_THRESHOLD = 10;

// ─── Types ────────────────────────────────────────────────────────────────────

type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

function getStockStatus(stock: number): StockStatus {
  if (stock === 0) return "out-of-stock";
  if (stock <= LOW_STOCK_THRESHOLD) return "low-stock";
  return "in-stock";
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-4 animate-pulse rounded-md bg-muted",
        className
      )}
    />
  );
}

export function ProductInfoCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col gap-0 sm:flex-row">
          {/* Image placeholder */}
          <div className="flex h-48 w-full items-center justify-center bg-muted sm:h-auto sm:w-56 sm:shrink-0">
            <Package className="h-16 w-16 text-muted-foreground/30 animate-pulse" />
          </div>

          {/* Info placeholder */}
          <div className="flex-1 space-y-5 p-6">
            <div className="space-y-3">
              <SkeletonLine className="h-7 w-3/4" />
              <SkeletonLine className="h-4 w-1/3" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonLine key={i} className="h-4" />
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <SkeletonLine className="h-9 flex-1" />
              <SkeletonLine className="h-9 flex-1" />
              <SkeletonLine className="h-9 flex-1" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Stock badge ──────────────────────────────────────────────────────────────

function StockBadge({ stock }: { stock: number }) {
  const status = getStockStatus(stock);

  const config = {
    "in-stock": {
      icon: CheckCircle2,
      label: "In Stock",
      variant: "success" as const,
    },
    "low-stock": {
      icon: AlertTriangle,
      label: "Low Stock",
      variant: "warning" as const,
    },
    "out-of-stock": {
      icon: XCircle,
      label: "Out of Stock",
      variant: "destructive" as const,
    },
  }[status];

  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className="inline-flex items-center gap-1.5 px-3 py-1 text-sm"
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
      {status === "low-stock" && (
        <span className="ml-0.5 opacity-70">({stock} left)</span>
      )}
    </Badge>
  );
}

// ─── Info row ────────────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("text-sm font-medium break-all", mono && "font-mono tracking-wide")}>
          {value ?? <span className="text-muted-foreground italic">—</span>}
        </p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ProductInfoCardProps {
  product: ProductWithCategory;
  className?: string;
}

/**
 * Displays full product details after a successful lookup.
 *
 * Shows: image, name, code, barcode, category, selling price,
 * stock with color-coded status badge, timestamps, and quick actions.
 */
export function ProductInfoCard({ product, className }: ProductInfoCardProps) {
  const stockStatus = getStockStatus(product.stock);
  const categoryName = product.categories?.name ?? "Uncategorized";

  return (
    <Card
      className={cn(
        "overflow-hidden border-2 transition-shadow hover:shadow-soft-lg animate-fade-in",
        stockStatus === "in-stock" && "border-success/20",
        stockStatus === "low-stock" && "border-warning/30",
        stockStatus === "out-of-stock" && "border-destructive/20",
        className
      )}
    >
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Product image */}
          <div
            className={cn(
              "relative flex h-56 w-full shrink-0 items-center justify-center overflow-hidden sm:h-auto sm:w-60",
              "bg-gradient-to-br from-muted/80 to-muted"
            )}
          >
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 240px"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-muted-foreground/50">
                <Package className="h-20 w-20" />
                <span className="text-xs font-medium uppercase tracking-widest opacity-60">
                  No Image
                </span>
              </div>
            )}

            {/* Stock overlay badge on image */}
            <div className="absolute bottom-3 left-3">
              <StockBadge stock={product.stock} />
            </div>
          </div>

          {/* Product details */}
          <div className="flex flex-1 flex-col gap-5 p-6">
            {/* Name + category */}
            <div>
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  <Tag className="mr-1 h-3 w-3" />
                  {categoryName}
                </Badge>
              </div>
              <h2 className="text-2xl font-semibold leading-tight tracking-tight">
                {product.name}
              </h2>
              <p className="mt-1 text-2xl font-bold text-primary">
                {formatCurrency(product.selling_price)}
              </p>
            </div>

            {/* Detail rows */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoRow
                icon={Hash}
                label="Product Code"
                value={product.product_code}
                mono
              />
              <InfoRow
                icon={Barcode}
                label="Barcode"
                value={product.barcode}
                mono
              />
              <InfoRow
                icon={Package}
                label="Current Stock"
                value={
                  <span
                    className={cn(
                      "font-semibold",
                      stockStatus === "in-stock" && "text-success",
                      stockStatus === "low-stock" && "text-warning",
                      stockStatus === "out-of-stock" && "text-destructive"
                    )}
                  >
                    {product.stock.toLocaleString()} units
                  </span>
                }
              />
              <InfoRow
                icon={Tag}
                label="Category"
                value={categoryName}
              />
              <InfoRow
                icon={Calendar}
                label="Created"
                value={formatDate(product.created_at)}
              />
              <InfoRow
                icon={RefreshCw}
                label="Last Updated"
                value={formatDate(product.updated_at)}
              />
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              <Button asChild size="sm" className="gap-1.5">
                <Link href={`/dashboard/products/${product.id}`}>
                  <ExternalLink className="h-3.5 w-3.5" />
                  View Detail
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link href="/dashboard/incoming">
                  <ArrowDownToLine className="h-3.5 w-3.5" />
                  Incoming Goods
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link href="/dashboard/outgoing">
                  <ArrowUpFromLine className="h-3.5 w-3.5" />
                  Outgoing Goods
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
