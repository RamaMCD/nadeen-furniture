"use client";

import * as React from "react";
import {
  History,
  ArrowDownToLine,
  ArrowUpFromLine,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { getTransactions } from "@/lib/db/transactions";
import type { TransactionWithProduct } from "@/lib/db/transactions";
import type { TransactionType } from "@/types/database";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_LIMIT = 25;

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-5 py-3 font-medium">Date</th>
            <th className="px-5 py-3 font-medium">Product</th>
            <th className="px-5 py-3 font-medium">Type</th>
            <th className="px-5 py-3 font-medium text-right">Qty</th>
            <th className="px-5 py-3 font-medium">Notes</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 8 }).map((_, i) => (
            <tr key={i} className="border-b last:border-0">
              <td className="px-5 py-3.5">
                <div className="h-4 w-28 animate-pulse rounded bg-muted" />
              </td>
              <td className="px-5 py-3.5">
                <div className="space-y-1.5">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                </div>
              </td>
              <td className="px-5 py-3.5">
                <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
              </td>
              <td className="px-5 py-3.5 text-right">
                <div className="ml-auto h-4 w-10 animate-pulse rounded bg-muted" />
              </td>

              <td className="px-5 py-3.5">
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Transaction row ──────────────────────────────────────────────────────────

function TransactionRow({ txn }: { txn: TransactionWithProduct }) {
  const isIncoming = txn.transaction_type === "incoming";
  return (
    <tr className="border-b last:border-0 transition-colors hover:bg-muted/40">
      <td className="whitespace-nowrap px-5 py-3.5 text-sm text-muted-foreground">
        {formatDate(txn.created_at)}
      </td>
      <td className="px-5 py-3.5">
        <div className="font-medium leading-tight">
          {txn.products?.name ?? <span className="italic text-muted-foreground">Unknown</span>}
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          {txn.products?.product_code ?? "—"}
        </div>
      </td>
      <td className="whitespace-nowrap px-5 py-3.5">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            isIncoming
              ? "bg-primary/10 text-primary"
              : "bg-warning/10 text-warning"
          )}
        >
          {isIncoming ? (
            <ArrowDownToLine className="h-3 w-3" />
          ) : (
            <ArrowUpFromLine className="h-3 w-3" />
          )}
          {isIncoming ? "Incoming" : "Outgoing"}
        </span>
      </td>
      <td className="px-5 py-3.5 text-right font-semibold tabular-nums">
        {isIncoming ? "+" : "−"}
        {txn.quantity.toLocaleString()}
      </td>

      <td className="max-w-[200px] px-5 py-3.5">
        {txn.notes ? (
          <span className="line-clamp-1 text-xs text-muted-foreground">
            {txn.notes}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type FilterType = "all" | TransactionType;

export default function HistoryPage() {
  const [filterType, setFilterType] = React.useState<FilterType>("all");
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [page, setPage] = React.useState(1);

  const [rows, setRows] = React.useState<TransactionWithProduct[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [fetchStatus, setFetchStatus] = React.useState<
    "loading" | "loaded" | "error"
  >("loading");
  const [errorMsg, setErrorMsg] = React.useState("");

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_LIMIT));

  // Debounce search input
  const searchDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 500);
  };

  // Reset page when filter changes
  const handleTypeChange = (t: FilterType) => {
    setFilterType(t);
    setPage(1);
  };

  // Fetch data
  const fetchData = React.useCallback(async () => {
    setFetchStatus("loading");
    try {
      const result = await getTransactions({
        type: filterType,
        search: debouncedSearch,
        page,
        limit: PAGE_LIMIT,
      });
      setRows(result.data);
      setTotalCount(result.count);
      setFetchStatus("loaded");
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to load transactions."
      );
      setFetchStatus("error");
    }
  }, [filterType, debouncedSearch, page]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Cleanup
  React.useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  const typeFilters: { value: FilterType; label: string }[] = [
    { value: "all", label: "All" },
    { value: "incoming", label: "Incoming" },
    { value: "outgoing", label: "Outgoing" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Transaction History
        </h1>
        <p className="text-sm text-muted-foreground">
          Browse all incoming and outgoing inventory movements.
          {totalCount > 0 && (
            <span className="ml-1 font-medium text-foreground">
              {totalCount.toLocaleString()} total records.
            </span>
          )}
        </p>
      </div>

      {/* Filter bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="history-search"
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by notes…"
                className={cn(
                  "flex h-10 w-full rounded-lg border border-input bg-card pl-9 pr-9 text-sm shadow-sm",
                  "transition-colors focus-visible:outline-none focus-visible:border-primary focus-visible:ring-0"
                )}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Type filter */}
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-0.5 shrink-0">
              <Filter className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
              {typeFilters.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleTypeChange(value)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                    filterType === value
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Refresh */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={fetchStatus === "loading"}
              className="shrink-0 gap-1.5"
            >
              <RefreshCw
                className={cn(
                  "h-3.5 w-3.5",
                  fetchStatus === "loading" && "animate-spin"
                )}
              />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table / States */}
      {fetchStatus === "error" ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-destructive/30 py-16 text-center">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <div className="space-y-1">
            <p className="font-semibold text-destructive">Failed to load</p>
            <p className="text-sm text-muted-foreground">{errorMsg}</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      ) : fetchStatus === "loading" ? (
        <TableSkeleton />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<History className="h-7 w-7" />}
          title={
            debouncedSearch || filterType !== "all"
              ? "No matching transactions"
              : "No transactions yet"
          }
          description={
            debouncedSearch || filterType !== "all"
              ? "Try adjusting your search or filter."
              : "Process your first incoming or outgoing goods to see history here."
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <CardHeader className="border-b p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3.5 font-medium">Date</th>
                    <th className="px-5 py-3.5 font-medium">Product</th>
                    <th className="px-5 py-3.5 font-medium">Type</th>
                    <th className="px-5 py-3.5 font-medium text-right">Qty</th>
                    <th className="px-5 py-3.5 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((txn) => (
                    <TransactionRow key={txn.id} txn={txn} />
                  ))}
                </tbody>
              </table>
            </div>
          </CardHeader>
          <CardContent className="p-0" />
        </Card>
      )}

      {/* Pagination */}
      {fetchStatus === "loaded" && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Page {page} of {totalPages} —{" "}
            {totalCount.toLocaleString()} records
          </p>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-8 w-8 p-0"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page number buttons */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const pageNum = start + i;
              if (pageNum > totalPages) return null;
              return (
                <Button
                  key={pageNum}
                  type="button"
                  variant={pageNum === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  className="h-8 w-8 p-0"
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-8 w-8 p-0"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
