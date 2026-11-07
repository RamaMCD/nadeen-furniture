/*
# WIMS — Migration 0003: Transaction RPC Functions

## Overview
Extends the `transactions` table with two optional metadata columns and
creates two PostgreSQL RPC functions that the frontend calls instead of
updating `products.stock` directly from React code.

## New Columns (transactions)
- `notes text`            — optional admin note for the transaction
- `reference_number text` — optional PO / delivery note / document reference

## RPC Functions

### process_incoming(p_product_id, p_quantity, p_notes, p_ref_number)
  1. Validates p_quantity > 0
  2. Validates product exists (raises P0002 if not)
  3. Increments products.stock by p_quantity (triggers set_updated_at)
  4. Inserts a transaction row of type 'incoming'
  5. Returns the new transaction uuid
  All steps run in a single implicit transaction (atomic).

### process_outgoing(p_product_id, p_quantity, p_notes, p_ref_number)
  1. Validates p_quantity > 0
  2. Locks the product row with FOR UPDATE (eliminates race conditions)
  3. Validates stock >= p_quantity (raises P0003 with human-readable message if not)
  4. Decrements products.stock by p_quantity (triggers set_updated_at)
  5. Inserts a transaction row of type 'outgoing'
  6. Returns the new transaction uuid
  All steps run in a single implicit transaction (atomic).

## Security
Both functions are SECURITY DEFINER so they run with the privileges of the
function owner (postgres), bypassing RLS for the UPDATE on products.stock.
RLS still applies to the caller's SELECT queries outside the functions.
GRANT EXECUTE is given to the `authenticated` role only.

## Race Condition Protection
process_outgoing uses SELECT ... FOR UPDATE to lock the product row before
reading and updating stock, preventing two concurrent outgoing transactions
from both passing the stock check and overdrawing stock.
*/

-- ============================================================
-- 1. Add metadata columns to transactions
-- ============================================================

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS reference_number text;

CREATE INDEX IF NOT EXISTS transactions_reference_number_idx
  ON transactions (reference_number)
  WHERE reference_number IS NOT NULL;

-- ============================================================
-- 2. RPC: process_incoming
-- ============================================================

CREATE OR REPLACE FUNCTION process_incoming(
  p_product_id  uuid,
  p_quantity    integer,
  p_notes       text    DEFAULT NULL,
  p_ref_number  text    DEFAULT NULL
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
    reference_number
  ) VALUES (
    p_product_id,
    'incoming',
    p_quantity,
    p_notes,
    p_ref_number
  )
  RETURNING id INTO v_transaction_id;

  RETURN v_transaction_id;
END;
$$;

GRANT EXECUTE ON FUNCTION process_incoming(uuid, integer, text, text)
  TO authenticated;

-- ============================================================
-- 3. RPC: process_outgoing
-- ============================================================

CREATE OR REPLACE FUNCTION process_outgoing(
  p_product_id  uuid,
  p_quantity    integer,
  p_notes       text    DEFAULT NULL,
  p_ref_number  text    DEFAULT NULL
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
    reference_number
  ) VALUES (
    p_product_id,
    'outgoing',
    p_quantity,
    p_notes,
    p_ref_number
  )
  RETURNING id INTO v_transaction_id;

  RETURN v_transaction_id;
END;
$$;

GRANT EXECUTE ON FUNCTION process_outgoing(uuid, integer, text, text)
  TO authenticated;
