"use client";

import * as React from "react";
import Image from "next/image";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Search,
  X,
  Package,
  Loader2,
  AlertTriangle,
  PackageSearch,
  Tag,
  Barcode,
  Hash,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarcodeScanner } from "@/components/product-lookup/barcode-scanner";
import { lookupProduct } from "@/lib/db/products";
import { processIncoming, processOutgoing } from "@/lib/db/transactions";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { ProductWithCategory } from "@/lib/db/products";

// ─── Constants ────────────────────────────────────────────────────────────────

const LOW_STOCK_THRESHOLD = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

function getStockStatus(stock: number): StockStatus {
  if (stock === 0) return "out-of-stock";
  if (stock <= LOW_STOCK_THRESHOLD) return "low-stock";
  return "in-stock";
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProductPreviewSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-3">
        <div className="h-5 w-32 rounded-md bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 shrink-0 rounded-xl bg-muted" />
          <div className="flex-1 space-y-2.5">
            <div className="h-5 w-2/3 rounded-md bg-muted" />
            <div className="flex gap-2">
              <div className="h-5 w-20 rounded-full bg-muted" />
              <div className="h-5 w-16 rounded-full bg-muted" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-4 w-full rounded-md bg-muted" />
              <div className="h-4 w-full rounded-md bg-muted" />
              <div className="h-4 w-full rounded-md bg-muted" />
              <div className="h-4 w-full rounded-md bg-muted" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── State types ──────────────────────────────────────────────────────────────

type LookupStatus = "idle" | "searching" | "found" | "not-found" | "error";
type SubmitStatus = "idle" | "submitting";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface TransactionFormProps {
  mode: "incoming" | "outgoing";
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Shared scan-to-save transaction form used by both Incoming and Outgoing pages.
 *
 * Workflow:
 * 1. User scans/types a barcode or product code.
 * 2. Product is automatically looked up from Supabase.
 * 3. Product preview is shown with current stock.
 * 4. User fills Quantity (required), Reference Number (optional), Notes (optional).
 * 5. Submit calls process_incoming or process_outgoing RPC — never a direct DB update.
 * 6. On success: toast + form reset + re-focus barcode input for next scan.
 * 7. On error: toast + form stays filled for correction.
 */
export function TransactionForm({ mode }: TransactionFormProps) {
  const isIncoming = mode === "incoming";
  const ModeIcon = isIncoming ? ArrowDownToLine : ArrowUpFromLine;
  const modeLabel = isIncoming ? "Incoming Goods" : "Outgoing Goods";
  const modeAccentBg = isIncoming ? "bg-primary/10" : "bg-warning/10";
  const modeAccentText = isIncoming ? "text-primary" : "text-warning";

  // ── Search state ──────────────────────────────────────────────────────────
  const [barcodeInput, setBarcodeInput] = React.useState("");
  const [lookupStatus, setLookupStatus] = React.useState<LookupStatus>("idle");
  const [product, setProduct] = React.useState<ProductWithCategory | null>(null);
  const [lookupError, setLookupError] = React.useState<string | null>(null);

  // ── Form state ────────────────────────────────────────────────────────────
  const [quantity, setQuantity] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [submitStatus, setSubmitStatus] = React.useState<SubmitStatus>("idle");

  const barcodeInputRef = React.useRef<HTMLInputElement>(null);
  const quantityInputRef = React.useRef<HTMLInputElement>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-focus barcode input on mount
  React.useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  // ── Product lookup ────────────────────────────────────────────────────────
  const performLookup = React.useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setLookupStatus("idle");
      setProduct(null);
      return;
    }

    setLookupStatus("searching");
    setProduct(null);
    setLookupError(null);

    try {
      const result = await lookupProduct(trimmed);
      if (result) {
        setProduct(result);
        setLookupStatus("found");
        // Auto-advance to quantity field
        setTimeout(() => quantityInputRef.current?.focus(), 80);
      } else {
        setLookupStatus("not-found");
      }
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : "Search failed.");
      setLookupStatus("error");
    }
  }, []);

  // ── Input handlers ────────────────────────────────────────────────────────
  const handleBarcodeChange = (val: string) => {
    setBarcodeInput(val);

    // Clear stale product result when the query changes
    if (product || lookupStatus === "found") {
      setProduct(null);
      setLookupStatus("idle");
      setQuantity("");
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim()) {
      debounceRef.current = setTimeout(() => performLookup(val), 600);
    } else {
      setLookupStatus("idle");
    }
  };

  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      performLookup(barcodeInput);
    }
  };

  const handleCameraScan = (barcode: string) => {
    setBarcodeInput(barcode);
    setProduct(null);
    setQuantity("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    performLookup(barcode);
  };

  const handleClear = () => {
    setBarcodeInput("");
    setProduct(null);
    setLookupStatus("idle");
    setLookupError(null);
    setQuantity("");
    setNotes("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    barcodeInputRef.current?.focus();
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || submitStatus === "submitting") return;

    const qty = parseInt(quantity, 10);
    if (!quantity.trim() || isNaN(qty) || qty <= 0) {
      toast.error("Please enter a valid quantity greater than 0.");
      quantityInputRef.current?.focus();
      return;
    }

    // Client-side stock pre-check for outgoing (the RPC also validates server-side)
    if (!isIncoming && qty > product.stock) {
      toast.error(
        `Insufficient stock. Available: ${product.stock.toLocaleString()} units, Requested: ${qty.toLocaleString()} units.`
      );
      return;
    }

    setSubmitStatus("submitting");

    try {
      const input = {
        product_id: product.id,
        quantity: qty,
        notes: notes.trim() || undefined,
      };

      if (isIncoming) {
        await processIncoming(input);
        toast.success(
          `✓ ${qty.toLocaleString()} units of "${product.name}" added to stock.`
        );
      } else {
        await processOutgoing(input);
        toast.success(
          `✓ ${qty.toLocaleString()} units of "${product.name}" removed from stock.`
        );
      }

      // Reset form — keep focus on barcode input for next scan
      setBarcodeInput("");
      setProduct(null);
      setLookupStatus("idle");
      setQuantity("");
      setNotes("");
      barcodeInputRef.current?.focus();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Transaction failed. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitStatus("idle");
    }
  };

  // Cleanup
  React.useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // ── Derived values ────────────────────────────────────────────────────────
  const stockStatus = product ? getStockStatus(product.stock) : null;
  const parsedQty = parseInt(quantity, 10);
  const qtyValid = !isNaN(parsedQty) && parsedQty > 0;

  const willOverdraw =
    !isIncoming && product && qtyValid && parsedQty > product.stock;
  const willDeplete =
    !isIncoming &&
    product &&
    qtyValid &&
    !willOverdraw &&
    product.stock - parsedQty <= LOW_STOCK_THRESHOLD;
  const remainingAfter =
    !isIncoming && product && qtyValid && !willOverdraw
      ? product.stock - parsedQty
      : null;

  const canSubmit =
    !!product &&
    qtyValid &&
    !willOverdraw &&
    submitStatus === "idle";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            modeAccentBg
          )}
        >
          <ModeIcon className={cn("h-5 w-5", modeAccentText)} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{modeLabel}</h1>
          <p className="text-sm text-muted-foreground">
            {isIncoming
              ? "Scan a barcode to record goods received into the warehouse"
              : "Scan a barcode to record goods dispatched from the warehouse"}
          </p>
        </div>
      </div>

      {/* ── STEP 1: Find product ──────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white",
                isIncoming ? "bg-primary" : "bg-warning"
              )}
            >
              1
            </span>
            Find Product
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barcode / product code input */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={barcodeInputRef}
                id="barcode-lookup-input"
                type="text"
                value={barcodeInput}
                onChange={(e) => handleBarcodeChange(e.target.value)}
                onKeyDown={handleBarcodeKeyDown}
                placeholder="Barcode or product code…"
                disabled={submitStatus === "submitting"}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                className={cn(
                  "flex h-14 w-full rounded-xl border-2 border-input bg-card text-base shadow-soft",
                  "pl-11 pr-12 font-mono tracking-wide",
                  "placeholder:font-sans placeholder:tracking-normal placeholder:text-muted-foreground",
                  "transition-all duration-150",
                  "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-0",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
              />
              {barcodeInput && (
                <button
                  type="button"
                  onClick={handleClear}
                  aria-label="Clear search"
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Manual search trigger */}
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={() => {
                if (debounceRef.current) clearTimeout(debounceRef.current);
                performLookup(barcodeInput);
              }}
              disabled={!barcodeInput.trim() || lookupStatus === "searching" || submitStatus === "submitting"}
              className="h-14 w-14 rounded-xl shrink-0 p-0"
              aria-label="Search"
            >
              {lookupStatus === "searching" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Camera scanner */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or scan with camera</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="flex justify-center">
            <BarcodeScanner
              onScan={handleCameraScan}
              disabled={submitStatus === "submitting"}
            />
          </div>

          {/* Not found state */}
          {lookupStatus === "not-found" && (
            <div className="flex items-start gap-3 rounded-xl border border-dashed p-4 text-sm animate-fade-in">
              <PackageSearch className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">
                No product matched{" "}
                <span className="font-mono font-semibold text-foreground">
                  &ldquo;{barcodeInput}&rdquo;
                </span>
                . Check the barcode and try again.
              </span>
            </div>
          )}

          {/* Error state */}
          {lookupStatus === "error" && (
            <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive animate-fade-in">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              {lookupError ?? "Product search failed. Please try again."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Searching skeleton ────────────────────────────────────────────── */}
      {lookupStatus === "searching" && <ProductPreviewSkeleton />}

      {/* ── Product preview ───────────────────────────────────────────────── */}
      {lookupStatus === "found" && product && (
        <Card
          className={cn(
            "overflow-hidden border-2 animate-fade-in",
            stockStatus === "in-stock" && "border-success/25",
            stockStatus === "low-stock" && "border-warning/35",
            stockStatus === "out-of-stock" && "border-destructive/25"
          )}
        >
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              {/* Product image */}
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                )}
              </div>

              {/* Product info */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                    {product.name}
                  </h3>
                  <Badge
                    variant={
                      stockStatus === "in-stock"
                        ? "success"
                        : stockStatus === "low-stock"
                        ? "warning"
                        : "destructive"
                    }
                    className="shrink-0 text-xs"
                  >
                    {stockStatus === "in-stock"
                      ? "In Stock"
                      : stockStatus === "low-stock"
                      ? "Low Stock"
                      : "Out of Stock"}
                  </Badge>
                </div>

                {product.categories?.name && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <Tag className="h-3 w-3" />
                    {product.categories.name}
                  </Badge>
                )}

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 min-w-0">
                    <Hash className="h-3 w-3 shrink-0" />
                    <span className="font-mono truncate">{product.product_code}</span>
                  </span>
                  <span className="flex items-center gap-1 min-w-0">
                    <Barcode className="h-3 w-3 shrink-0" />
                    <span className="font-mono truncate">{product.barcode ?? "—"}</span>
                  </span>
                  <span>
                    Price:{" "}
                    <strong className="text-foreground">
                      {formatCurrency(product.selling_price)}
                    </strong>
                  </span>
                  <span>
                    Stock:{" "}
                    <strong
                      className={cn(
                        stockStatus === "in-stock" && "text-success",
                        stockStatus === "low-stock" && "text-warning",
                        stockStatus === "out-of-stock" && "text-destructive"
                      )}
                    >
                      {product.stock.toLocaleString()} units
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── STEP 2: Transaction details ───────────────────────────────────── */}
      {lookupStatus === "found" && product && (
        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white",
                  isIncoming ? "bg-primary" : "bg-warning"
                )}
              >
                2
              </span>
              Transaction Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Quantity */}
            <div className="space-y-1.5">
              <label
                htmlFor="txn-quantity"
                className="text-sm font-medium"
              >
                Quantity{" "}
                <span className="text-destructive">*</span>
              </label>
              <input
                ref={quantityInputRef}
                id="txn-quantity"
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                disabled={submitStatus === "submitting"}
                className={cn(
                  "flex h-16 w-full rounded-xl border-2 bg-card px-4 text-3xl font-bold shadow-soft",
                  "text-center transition-all duration-150",
                  "focus-visible:outline-none focus-visible:ring-0",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  willOverdraw
                    ? "border-destructive text-destructive focus-visible:border-destructive"
                    : "border-input focus-visible:border-primary"
                )}
              />

              {/* Stock validation feedback */}
              {willOverdraw && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-destructive animate-fade-in">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  Insufficient stock — only {product.stock.toLocaleString()} units
                  available.
                </p>
              )}
              {willDeplete && !willOverdraw && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-warning animate-fade-in">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  Stock will drop to{" "}
                  <strong>{remainingAfter?.toLocaleString()} units</strong>{" "}
                  after this transaction (low stock).
                </p>
              )}
              {isIncoming && qtyValid && parsedQty > 0 && (
                <p className="flex items-center gap-1.5 text-xs text-success">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  Stock will increase to{" "}
                  <strong>
                    {(product.stock + parsedQty).toLocaleString()} units
                  </strong>
                  .
                </p>
              )}
            </div>



            {/* Notes */}
            <div className="space-y-1.5">
              <label htmlFor="txn-notes" className="text-sm font-medium">
                Notes{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (optional)
                </span>
              </label>
              <textarea
                id="txn-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about this transaction…"
                rows={2}
                disabled={submitStatus === "submitting"}
                className={cn(
                  "flex w-full resize-none rounded-xl border border-input bg-card px-4 py-3 text-sm shadow-soft",
                  "transition-all duration-150",
                  "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-0",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
              />
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                "w-full h-12 gap-2 text-base font-semibold rounded-xl",
                !isIncoming &&
                  "bg-warning text-warning-foreground hover:bg-warning/90"
              )}
            >
              {submitStatus === "submitting" ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <ModeIcon className="h-5 w-5" />
                  Save {modeLabel}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </form>
  );
}
