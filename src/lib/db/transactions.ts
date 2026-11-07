/**
 * Transactions data-access layer.
 *
 * Stock mutations are performed exclusively via PostgreSQL RPC functions
 * (`process_incoming`, `process_outgoing`) — never by direct UPDATE from
 * the frontend. This guarantees atomicity and prevents race conditions.
 *
 * Schema in sync with migration 0004 (20260803_0004_sync_transactions.sql).
 * transactions table columns:
 *   id, product_id, transaction_type, quantity,
 *   notes, reference_number, created_by, created_at
 */

import { createClient } from "@/lib/supabase/client";
import type { TransactionType } from "@/types/database";

// ─── Input / output types ─────────────────────────────────────────────────────

export interface TransactionInput {
  product_id: string;
  quantity: number;
  notes?: string;
  /** Email / name of the admin who performed the operation. Optional. */
  created_by?: string;
}

/** Transaction row joined with its product's display fields. */
export interface TransactionWithProduct {
  id: string;
  transaction_type: TransactionType;
  quantity: number;
  notes: string | null;

  created_by: string | null;
  created_at: string;
  products: {
    name: string;
    product_code: string;
    barcode: string | null;
  } | null;
}

export interface GetTransactionsOptions {
  /** Filter by type; omit or pass "all" for no filter. */
  type?: TransactionType | "all";
  /** Searches notes (case-insensitive). */
  search?: string;
  /** 1-based page number (default: 1). */
  page?: number;
  /** Rows per page (default: 25). */
  limit?: number;
}

export interface GetTransactionsResult {
  data: TransactionWithProduct[];
  /** Total matching row count (for pagination). */
  count: number;
}

// ─── Mutations (via RPC) ──────────────────────────────────────────────────────

/**
 * Record an incoming goods transaction.
 *
 * Calls the `process_incoming` PostgreSQL RPC which atomically:
 *  1. Validates the product exists.
 *  2. Increments `products.stock` by `quantity`.
 *  3. Inserts a `transactions` row (notes, reference_number, created_by).
 *
 * Returns the new transaction UUID.
 * Throws a descriptive Error on any failure.
 */
export async function processIncoming(input: TransactionInput): Promise<string> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("process_incoming", {
    p_product_id: input.product_id,
    p_quantity: input.quantity,
    p_notes: input.notes ?? null,
    p_ref_number: null,
    p_created_by: input.created_by ?? null,
  } as never);

  if (error) throw new Error(error.message);
  return data as string;
}

/**
 * Record an outgoing goods transaction.
 *
 * Calls the `process_outgoing` PostgreSQL RPC which atomically:
 *  1. Locks the product row (FOR UPDATE) to prevent concurrent overdrawing.
 *  2. Validates stock >= quantity — throws if insufficient.
 *  3. Decrements `products.stock` by `quantity`.
 *  4. Inserts a `transactions` row (notes, reference_number, created_by).
 *
 * Returns the new transaction UUID.
 * Throws a descriptive Error on any failure.
 */
export async function processOutgoing(input: TransactionInput): Promise<string> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("process_outgoing", {
    p_product_id: input.product_id,
    p_quantity: input.quantity,
    p_notes: input.notes ?? null,
    p_ref_number: null,
    p_created_by: input.created_by ?? null,
  } as never);

  if (error) throw new Error(error.message);
  return data as string;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Paginated transaction list joined with product display fields.
 * Supports type filter and text search on reference_number / notes.
 */
export async function getTransactions(
  opts: GetTransactionsOptions = {}
): Promise<GetTransactionsResult> {
  const supabase = createClient();
  const { type, search, page = 1, limit = 25 } = opts;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = supabase
    .from("transactions")
    .select(
      "id, transaction_type, quantity, notes, created_by, created_at, products(name, product_code, barcode)",
      { count: "exact" }
    );

  if (type && type !== "all") {
    query = query.eq("transaction_type", type);
  }

  if (search?.trim()) {
    const term = search.trim();
    query = query.ilike("notes", `%${term}%`);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = (await query
    .order("created_at", { ascending: false })
    .range(from, to)) as {
    data: TransactionWithProduct[] | null;
    error: { message: string } | null;
    count: number | null;
  };

  if (error) throw new Error(error.message);

  return {
    data: data ?? [],
    count: count ?? 0,
  };
}
