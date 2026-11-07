"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Globe,
  EyeOff,
} from "lucide-react";
import {
  getProducts,
  deleteProduct,
  type ProductWithCategory,
  type GetProductsOptions,
} from "@/lib/db/products";
import { getCategories } from "@/lib/db/categories";
import { deleteProductImages } from "@/lib/db/storage";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/database";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

function stockColor(stock: number) {
  if (stock === 0) return "text-destructive";
  if (stock < 10) return "text-warning";
  return "text-success";
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-border animate-pulse">
      <td className="px-4 py-3.5">
        <div className="h-10 w-10 rounded-lg bg-muted" />
      </td>
      <td className="px-4 py-3.5"><div className="h-4 w-24 rounded bg-muted" /></td>
      <td className="px-4 py-3.5"><div className="h-4 w-36 rounded bg-muted" /></td>
      <td className="px-4 py-3.5"><div className="h-5 w-20 rounded-full bg-muted" /></td>
      <td className="px-4 py-3.5"><div className="h-4 w-16 rounded bg-muted" /></td>
      <td className="px-4 py-3.5"><div className="h-4 w-10 rounded bg-muted" /></td>
      <td className="px-4 py-3.5"><div className="h-5 w-16 rounded-full bg-muted" /></td>
      <td className="px-4 py-3.5">
        <div className="flex gap-2">
          <div className="h-8 w-8 rounded-md bg-muted" />
          <div className="h-8 w-8 rounded-md bg-muted" />
          <div className="h-8 w-8 rounded-md bg-muted" />
        </div>
      </td>
    </tr>
  );
}

// ─── Page component ───────────────────────────────────────────────────────────

export default function ProductsPage() {
  // ── Data state ──────────────────────────────────────────────────────────────
  const [products, setProducts] = React.useState<ProductWithCategory[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // ── Filter / pagination state ────────────────────────────────────────────────
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("");
  const [page, setPage] = React.useState(1);

  // Debounce search so we don't fire on every keystroke
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryFilter]);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [formDialog, setFormDialog] = React.useState<{
    open: boolean;
    mode: "add" | "edit";
    product?: ProductWithCategory;
  }>({ open: false, mode: "add" });

  const [deleteDialog, setDeleteDialog] = React.useState<{
    open: boolean;
    product?: ProductWithCategory;
  }>({ open: false });
  const [isDeleting, setIsDeleting] = React.useState(false);

  // ── Load data ────────────────────────────────────────────────────────────────
  const loadCategories = React.useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch {
      // Non-fatal: categories are for filter dropdown only
    }
  }, []);

  const loadProducts = React.useCallback(async () => {
    setIsLoading(true);
    const opts: GetProductsOptions = {
      search: debouncedSearch,
      categoryId: categoryFilter || undefined,
      page,
      limit: PAGE_SIZE,
    };
    try {
      const { data, count } = await getProducts(opts);
      setProducts(data);
      setTotalCount(count);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load products."
      );
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, categoryFilter, page]);

  // Initial load
  React.useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  React.useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // ── Pagination ───────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  // ── Handlers ────────────────────────────────────────────────────────────────
  const openAdd = () => setFormDialog({ open: true, mode: "add" });
  const openEdit = (product: ProductWithCategory) =>
    setFormDialog({ open: true, mode: "edit", product });
  const openDelete = (product: ProductWithCategory) =>
    setDeleteDialog({ open: true, product });

  const handleFormSuccess = (_product: ProductWithCategory) => {
    // Reload the current page to get fresh data with category names
    loadProducts();
  };

  const handleDelete = async () => {
    if (!deleteDialog.product) return;
    setIsDeleting(true);
    try {
      const { id, name, image_url } = deleteDialog.product;
      await deleteProduct(id);
      // Clean up storage (non-fatal)
      if (image_url) {
        await deleteProductImages(id);
      }
      toast.success(`"${name}" deleted successfully.`);
      setDeleteDialog({ open: false });
      // If we just deleted the last item on the last page, go back
      if (products.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        loadProducts();
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete product."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage your product catalog and stock levels
          </p>
        </div>
        <Button onClick={openAdd} className="mt-3 sm:mt-0">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, code, or barcode…"
          className="sm:max-w-xs"
        />
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          placeholder="All Categories"
          className="sm:w-48"
          aria-label="Filter by category"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        {!isLoading && (
          <span className="text-sm text-muted-foreground sm:ml-auto">
            {formatNumber(totalCount)}{" "}
            {totalCount === 1 ? "product" : "products"}
          </span>
        )}
      </div>

      {/* Table card */}
      <Card>
        <CardHeader className="border-b border-border px-6 py-4">
          <CardTitle>Product Catalog</CardTitle>
          <CardDescription>
            Click the eye icon to view full product details and barcode.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-medium w-16">Image</th>
                    <th className="px-4 py-3 font-medium">Code</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Stock</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : products.length === 0 ? (
            <div className="px-6 py-8">
              <EmptyState
                icon={<Package className="h-7 w-7" />}
                title={
                  debouncedSearch || categoryFilter
                    ? "No products match your filters"
                    : "No products yet"
                }
                description={
                  debouncedSearch || categoryFilter
                    ? "Try adjusting your search or category filter."
                    : "Add your first product to start managing inventory."
                }
                action={
                  !debouncedSearch && !categoryFilter ? (
                    <Button size="sm" onClick={openAdd}>
                      <Plus className="h-4 w-4" />
                      Add Product
                    </Button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-3 font-medium w-16">Image</th>
                      <th className="px-4 py-3 font-medium">Code</th>
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Category</th>
                      <th className="px-4 py-3 font-medium">Price</th>
                      <th className="px-4 py-3 font-medium">Stock</th>
                      <th className="px-4 py-3 font-medium">Published</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b border-border last:border-0 transition-colors hover:bg-muted/40"
                      >
                        {/* Thumbnail */}
                        <td className="px-4 py-3.5">
                          <div className="relative h-10 w-10 overflow-hidden rounded-lg border bg-muted">
                            {product.image_url ? (
                              <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Package className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Code */}
                        <td className="px-4 py-3.5">
                          <Link
                            href={`/dashboard/products/${product.id}`}
                            className="font-mono text-xs text-primary hover:underline"
                          >
                            {product.product_code}
                          </Link>
                        </td>

                        {/* Name */}
                        <td className="px-4 py-3.5">
                          <span className="font-medium">{product.name}</span>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3.5">
                          <Badge variant="secondary">
                            {product.categories?.name ?? "—"}
                          </Badge>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3.5 font-medium">
                          {formatCurrency(product.selling_price)}
                        </td>

                        {/* Stock */}
                        <td className="px-4 py-3.5">
                          <span
                            className={cn(
                              "font-semibold tabular-nums",
                              stockColor(product.stock)
                            )}
                          >
                            {formatNumber(product.stock)}
                          </span>
                        </td>

                        {/* Published */}
                        <td className="px-4 py-3.5">
                          {product.is_published ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full">
                              <Globe className="h-3 w-3" />
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full">
                              <EyeOff className="h-3 w-3" />
                              Draft
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <Button variant="ghost" size="icon" asChild>
                              <Link
                                href={`/dashboard/products/${product.id}`}
                                aria-label="View product"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(product)}
                              aria-label="Edit product"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => openDelete(product)}
                              aria-label="Delete product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border px-6 py-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages} ·{" "}
                    {formatNumber(totalCount)} total
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p - 1)}
                      disabled={!hasPrev || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!hasNext || isLoading}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ProductFormDialog
        mode={formDialog.mode}
        product={formDialog.product}
        categories={categories}
        open={formDialog.open}
        onOpenChange={(open) => setFormDialog((prev) => ({ ...prev, open }))}
        onSuccess={handleFormSuccess}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
        title="Delete Product"
        description={
          deleteDialog.product
            ? `Are you sure you want to delete "${deleteDialog.product.name}" (${deleteDialog.product.product_code})? This will also remove all associated transaction history. This action cannot be undone.`
            : "Are you sure you want to delete this product?"
        }
        confirmLabel="Delete Product"
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </div>
  );
}
