"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Tag,
  DollarSign,
  Boxes,
  Calendar,
  Clock,
  Pencil,
  Trash2,
  Loader2,
  Globe,
  EyeOff,
  ExternalLink,
  FileText,
} from "lucide-react";
import { getProductById, deleteProduct, type ProductWithCategory } from "@/lib/db/products";
import { getCategories } from "@/lib/db/categories";
import { deleteProductImages } from "@/lib/db/storage";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BarcodeDisplay } from "@/components/products/barcode-display";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { Category } from "@/types/database";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function stockVariant(stock: number): "success" | "warning" | "destructive" {
  if (stock === 0) return "destructive";
  if (stock < 10) return "warning";
  return "success";
}

// ─── Info Row ────────────────────────────────────────────────────────────────

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="mt-0.5 text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-6 w-32 rounded bg-muted" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="h-72 rounded-xl bg-muted" />
        <div className="lg:col-span-2 space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-px w-full bg-muted" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-muted" />
              <div className="space-y-1.5">
                <div className="h-3 w-16 rounded bg-muted" />
                <div className="h-4 w-32 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page component ───────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [product, setProduct] = React.useState<ProductWithCategory | null>(null);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);

  // Edit dialog
  const [editOpen, setEditOpen] = React.useState(false);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // ── Load ────────────────────────────────────────────────────────────────────
  const loadProduct = React.useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [productData, categoryData] = await Promise.all([
        getProductById(id),
        getCategories(),
      ]);
      if (!productData) {
        setNotFound(true);
        return;
      }
      setProduct(productData);
      setCategories(categoryData);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load product.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleEditSuccess = (updated: ProductWithCategory) => {
    setProduct(updated);
    toast.success("Product updated successfully.");
  };

  const handleDelete = async () => {
    if (!product) return;
    setIsDeleting(true);
    try {
      await deleteProduct(product.id);
      if (product.image_url) {
        await deleteProductImages(product.id);
      }
      toast.success(`"${product.name}" deleted successfully.`);
      router.push("/dashboard/products");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete product.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Not found ────────────────────────────────────────────────────────────────
  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <Package className="h-7 w-7 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-medium">Product not found</p>
          <p className="text-sm text-muted-foreground">
            This product may have been deleted.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/products">
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
        </Button>
      </div>
    );
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-9 w-36 rounded bg-muted animate-pulse" />
        <DetailSkeleton />
      </div>
    );
  }

  if (!product) return null;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Breadcrumb / back */}
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/dashboard/products">
            <ArrowLeft className="h-4 w-4" />
            Products
          </Link>
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="font-mono text-sm text-muted-foreground">
          {product.product_code}
        </span>
      </div>

      {/* Header row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            {product.product_code}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            className="text-destructive hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: image + barcode */}
        <div className="space-y-4">
          {/* Product image */}
          <Card>
            <CardContent className="p-3">
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 1024px) 100vw, 320px"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Package className="h-10 w-10" />
                    <span className="text-xs">No image</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Barcode */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Barcode</CardTitle>
            </CardHeader>
            <CardContent>
              <BarcodeDisplay
                value={product.barcode ?? product.product_code}
                productName={product.name}
                productCode={product.product_code}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right column: info */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Info rows */}
              <InfoRow
                icon={<Tag className="h-4 w-4" />}
                label="Product Code"
                value={
                  <span className="font-mono">{product.product_code}</span>
                }
              />

              <InfoRow
                icon={<Tag className="h-4 w-4" />}
                label="Barcode"
                value={
                  <span className="font-mono">
                    {product.barcode ?? "—"}
                  </span>
                }
              />

              <InfoRow
                icon={<Package className="h-4 w-4" />}
                label="Category"
                value={
                  <Badge variant="secondary">
                    {product.categories?.name ?? "Uncategorised"}
                  </Badge>
                }
              />

              <InfoRow
                icon={<DollarSign className="h-4 w-4" />}
                label="Selling Price"
                value={
                  <span className="text-base font-semibold text-foreground">
                    {formatCurrency(product.selling_price)}
                  </span>
                }
              />

              <InfoRow
                icon={<Boxes className="h-4 w-4" />}
                label="Current Stock"
                value={
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        product.stock === 0
                          ? "text-destructive font-semibold"
                          : product.stock < 10
                          ? "text-warning font-semibold"
                          : "text-success font-semibold"
                      }
                    >
                      {formatNumber(product.stock)} units
                    </span>
                    <Badge variant={stockVariant(product.stock)}>
                      {product.stock === 0
                        ? "Out of stock"
                        : product.stock < 10
                        ? "Low stock"
                        : "In stock"}
                    </Badge>
                  </div>
                }
              />

              <Separator />

              <InfoRow
                icon={<Calendar className="h-4 w-4" />}
                label="Created"
                value={
                  <span className="text-muted-foreground">
                    {formatDateTime(product.created_at)}
                  </span>
                }
              />

              <InfoRow
                icon={<Clock className="h-4 w-4" />}
                label="Last Updated"
                value={
                  <span className="text-muted-foreground">
                    {formatDateTime(product.updated_at)}
                  </span>
                }
              />

              <Separator />

              <InfoRow
                icon={
                  product.is_published ? (
                    <Globe className="h-4 w-4 text-success" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )
                }
                label="Public Catalog"
                value={
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        product.is_published
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {product.is_published ? (
                        <>
                          <Globe className="h-3 w-3" />
                          Published
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3" />
                          Draft (Hidden from Catalog)
                        </>
                      )}
                    </span>
                    {product.is_published && (
                      <Link
                        href={`/catalog/${product.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        View in Public Catalog
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                }
              />
            </CardContent>
          </Card>

          {/* Description & Specifications for public catalog */}
          {(product.description || product.specifications) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Public Catalog Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.description && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Marketing Description
                    </h4>
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed bg-muted/30 p-3 rounded-lg border">
                      {product.description}
                    </p>
                  </div>
                )}
                {product.specifications && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Technical Specifications
                    </h4>
                    <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed bg-muted/30 p-3 rounded-lg border">
                      {product.specifications}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <ProductFormDialog
        mode="edit"
        product={product}
        categories={categories}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={handleEditSuccess}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Product"
        description={`Are you sure you want to delete "${product.name}" (${product.product_code})? All associated transaction history will also be permanently removed.`}
        confirmLabel="Delete Product"
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </div>
  );
}
