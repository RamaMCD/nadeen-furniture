/*
# WIMS — Migration 0004: Synchronize transactions table

## Root Cause
Migration 0003 (20260803_0003_transaction_rpcs.sql) was created locally but
was NEVER executed against the live Supabase database. The live `transactions`
table therefore still only has the 5 columns created by migration 0001:
  id, product_id, transaction_type, quantity, created_at

The application code (DB layer, TypeScript types) already expects:
  notes, reference_number — from migration 0003
  created_by             — required per updated spec

This migration brings the live database fully in sync with the application.

## What this migration does (in order)
1. Adds `notes text` (nullable)            — if not already present
2. Adds `reference_number text` (nullable) — if not already present
3. Adds `created_by text` (nullable)       — new column per spec
4. Creates supporting indexes
5. Creates / replaces `process_incoming` RPC (includes notes, reference_number)
6. Creates / replaces `process_outgoing` RPC (includes notes, reference_number)
7. Grants EXECUTE on both RPCs to `authenticated`

## Safety
- Every ALTER TABLE uses ADD COLUMN IF NOT EXISTS  → idempotent, safe to re-run
- Every CREATE INDEX uses IF NOT EXISTS            → idempotent
- Both RPCs use CREATE OR REPLACE FUNCTION         → idempotent
- Existing rows are not modified (NULL is valid for the new nullable columns)
- No data is lost; no tables are recreated
*/

-- ============================================================
-- 1. Extend transactions table
-- ============================================================

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS notes             text,
  ADD COLUMN IF NOT EXISTS reference_number  text,
  ADD COLUMN IF NOT EXISTS created_by        text;

-- ============================================================
-- 2. Supporting indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS transactions_reference_number_idx
  ON transactions (reference_number)
  WHERE reference_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS transactions_created_by_idx
  ON transactions (created_by)
  WHERE created_by IS NOT NULL;

-- ============================================================
-- 3. RPC: process_incoming
--    Atomically increments stock and records the transaction.
-- ============================================================

CREATE OR REPLACE FUNCTION process_incoming(
  p_product_id  uuid,
  p_quantity    integer,
  p_notes       text    DEFAULT NULL,
  p_ref_number  text    DEFAULT NULL,
  p_created_by  text    DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_exists          boolean;
  v_transaction_id  uuid;
BEGIN
  -- Validate quantity
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'Quantity must be greater than 0.'
      USING ERRCODE = 'P0001';
  END IF;

  -- Validate product exists
  SELECT EXISTS (
    SELECT 1 FROM products WHERE id = p_product_id
  ) INTO v_exists;

  IF NOT v_exists THEN
    RAISE EXCEPTION 'Product not found.'
      USING ERRCODE = 'P0002';
  END IF;

  -- Increase stock (set_updated_at trigger fires automatically)
  UPDATE products
  SET stock = stock + p_quantity
  WHERE id = p_product_id;

  -- Record the transaction
  INSERT INTO transactions (
    product_id,
    transaction_type,
    quantity,
    notes,
    reference_number,
    created_by
  ) VALUES (
    p_product_id,
    'incoming',
    p_quantity,
    p_notes,
    p_ref_number,
    p_created_by
  )
  RETURNING id INTO v_transaction_id;

  RETURN v_transaction_id;
END;
$$;

GRANT EXECUTE ON FUNCTION process_incoming(uuid, integer, text, text, text)
  TO authenticated;

-- ============================================================
-- 4. RPC: process_outgoing
--    Uses FOR UPDATE to prevent concurrent stock overdrawing.
--    Atomically decrements stock and records the transaction.
-- ============================================================

CREATE OR REPLACE FUNCTION process_outgoing(
  p_product_id  uuid,
  p_quantity    integer,
  p_notes       text    DEFAULT NULL,
  p_ref_number  text    DEFAULT NULL,
  p_created_by  text    DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_stock  integer;
  v_transaction_id uuid;
BEGIN
  -- Validate quantity
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'Quantity must be greater than 0.'
      USING ERRCODE = 'P0001';
  END IF;

  -- Lock product row to prevent concurrent overdrawing
  SELECT stock INTO v_current_stock
  FROM products
  WHERE id = p_product_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found.'
      USING ERRCODE = 'P0002';
  END IF;

  -- Check sufficient stock
  IF v_current_stock < p_quantity THEN
    RAISE EXCEPTION 'Insufficient stock. Available: %, Requested: %.',
      v_current_stock, p_quantity
      USING ERRCODE = 'P0003';
  END IF;

  -- Decrease stock (set_updated_at trigger fires automatically)
  UPDATE products
  SET stock = stock - p_quantity
  WHERE id = p_product_id;

  -- Record the transaction
  INSERT INTO transactions (
    product_id,
    transaction_type,
    quantity,
    notes,
    reference_number,
    created_by
  ) VALUES (
    p_product_id,
    'outgoing',
    p_quantity,
    p_notes,
    p_ref_number,
    p_created_by
  )
  RETURNING id INTO v_transaction_id;

  RETURN v_transaction_id;
END;
$$;

GRANT EXECUTE ON FUNCTION process_outgoing(uuid, integer, text, text, text)
  TO authenticated;

-- ============================================================
-- Verification query (informational — safe to run anytime)
-- Run this after applying the migration to confirm all columns exist:
--
--   SELECT column_name, data_type, is_nullable
--   FROM information_schema.columns
--   WHERE table_schema = 'public'
--     AND table_name = 'transactions'
--   ORDER BY ordinal_position;
--
-- Expected columns:
--   id                uuid    NO
--   product_id        uuid    NO
--   transaction_type  text    NO
--   quantity          integer NO
--   created_at        timestamptz NO
--   notes             text    YES
--   reference_number  text    YES
--   created_by        text    YES
-- ============================================================
