"use client";

import * as React from "react";
import { ScanSearch, PackageSearch, AlertCircle, RotateCcw } from "lucide-react";
import { LookupSearchBar } from "@/components/product-lookup/lookup-search-bar";
import {
  ProductInfoCard,
  ProductInfoCardSkeleton,
} from "@/components/product-lookup/product-info-card";
import { Button } from "@/components/ui/button";
import { lookupProduct } from "@/lib/db/products";
import type { ProductWithCategory } from "@/lib/db/products";
import { cn } from "@/lib/utils";

// ─── Page state ───────────────────────────────────────────────────────────────

type PageStatus = "idle" | "loading" | "found" | "not-found" | "error";

// ─── Idle / hero state ────────────────────────────────────────────────────────

function IdleState() {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6 rounded-2xl border-2 border-dashed border-border",
        "py-20 text-center animate-fade-in"
      )}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
        <ScanSearch className="h-10 w-10 text-primary" />
      </div>
      <div className="space-y-2">
        <p className="text-lg font-semibold">Ready to Lookup</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          Enter a barcode or product code above, or use your camera to scan a
          barcode and instantly identify a product.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5 rounded-full border px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Manual barcode input
        </span>
        <span className="flex items-center gap-1.5 rounded-full border px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Product code input
        </span>
        <span className="flex items-center gap-1.5 rounded-full border px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-warning" />
          Camera scanner
        </span>
      </div>
    </div>
  );
}

// ─── Not found state ──────────────────────────────────────────────────────────

function NotFoundState({
  query,
  onReset,
}: {
  query: string;
  onReset: () => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed border-border",
        "py-20 text-center animate-fade-in"
      )}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
        <PackageSearch className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <p className="text-lg font-semibold">Product Not Found</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          No product matched{" "}
          <span className="font-mono font-semibold text-foreground">
            &ldquo;{query}&rdquo;
          </span>
          . Check the barcode or product code and try again.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onReset} className="gap-2">
        <RotateCcw className="h-4 w-4" />
        Search Again
      </Button>
    </div>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed border-destructive/30",
        "py-20 text-center animate-fade-in"
      )}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-destructive/10">
        <AlertCircle className="h-10 w-10 text-destructive" />
      </div>
      <div className="space-y-2">
        <p className="text-lg font-semibold text-destructive">Search Failed</p>
        <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
        <RotateCcw className="h-4 w-4" />
        Retry
      </Button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductLookupPage() {
  const [status, setStatus] = React.useState<PageStatus>("idle");
  const [product, setProduct] = React.useState<ProductWithCategory | null>(null);
  const [lastQuery, setLastQuery] = React.useState<string>("");
  const [errorMessage, setErrorMessage] = React.useState<string>("");

  const handleSearch = React.useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setLastQuery(trimmed);
    setStatus("loading");
    setProduct(null);

    try {
      const result = await lookupProduct(trimmed);
      if (result) {
        setProduct(result);
        setStatus("found");
      } else {
        setStatus("not-found");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while searching.";
      setErrorMessage(msg);
      setStatus("error");
    }
  }, []);

  const handleReset = () => {
    setStatus("idle");
    setProduct(null);
    setLastQuery("");
    setErrorMessage("");
  };

  const handleRetry = () => {
    if (lastQuery) handleSearch(lastQuery);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Product Lookup</h1>
        <p className="text-sm text-muted-foreground">
          Quickly identify any product by scanning or entering its barcode or product code.
          Read-only — no stock changes.
        </p>
      </div>

      {/* Search bar */}
      <LookupSearchBar onSearch={handleSearch} isLoading={status === "loading"} />

      {/* Result area */}
      <div className="space-y-4">
        {/* Last searched query chip */}
        {status !== "idle" && lastQuery && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Results for{" "}
              <span className="font-mono font-semibold text-foreground">
                &ldquo;{lastQuery}&rdquo;
              </span>
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" />
              Clear
            </Button>
          </div>
        )}

        {/* States */}
        {status === "idle" && <IdleState />}
        {status === "loading" && <ProductInfoCardSkeleton />}
        {status === "found" && product && <ProductInfoCard product={product} />}
        {status === "not-found" && (
          <NotFoundState query={lastQuery} onReset={handleReset} />
        )}
        {status === "error" && (
          <ErrorState message={errorMessage} onRetry={handleRetry} />
        )}
      </div>
    </div>
  );
}
