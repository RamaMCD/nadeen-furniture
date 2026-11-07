"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Globe, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ProductImageUpload } from "@/components/products/product-image-upload";
import { createProduct, updateProduct, type ProductWithCategory } from "@/lib/db/products";
import { uploadProductImage, deleteProductImageByUrl } from "@/lib/db/storage";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/database";

// ─── Validation ──────────────────────────────────────────────────────────────

const productSchema = z.object({
  name: z
    .string()
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name must be at most 100 characters")
    .trim(),
  category_id: z
    .string()
    .min(1, "Please select a category"),
  selling_price: z
    .coerce
    .number({ invalid_type_error: "Enter a valid price" })
    .min(0, "Price cannot be negative"),
  stock: z
    .coerce
    .number({ invalid_type_error: "Enter a valid quantity" })
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative"),
  is_published: z.boolean(),
  description: z.string().max(2000, "Description must be at most 2000 characters").optional(),
  specifications: z.string().max(2000, "Specifications must be at most 2000 characters").optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

// ─── Props ───────────────────────────────────────────────────────────────────

interface ProductFormDialogProps {
  mode: "add" | "edit";
  product?: ProductWithCategory;
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (product: ProductWithCategory) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ProductFormDialog({
  mode,
  product,
  categories,
  open,
  onOpenChange,
  onSuccess,
}: ProductFormDialogProps) {
  const isEdit = mode === "edit";

  // Image file state lives outside RHF (File objects aren't serialisable)
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imageUploadError, setImageUploadError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      category_id: product?.category_id ?? "",
      selling_price: product?.selling_price ?? 0,
      stock: product?.stock ?? 0,
      is_published: product?.is_published ?? false,
      description: product?.description ?? "",
      specifications: product?.specifications ?? "",
    },
  });

  const isPublished = watch("is_published");

  // Sync form when dialog opens for a different product
  React.useEffect(() => {
    if (open) {
      reset({
        name: product?.name ?? "",
        category_id: product?.category_id ?? "",
        selling_price: product?.selling_price ?? 0,
        stock: product?.stock ?? 0,
        is_published: product?.is_published ?? false,
        description: product?.description ?? "",
        specifications: product?.specifications ?? "",
      });
      setImageFile(null);
      setImageUploadError(null);
    }
  }, [open, product, reset]);

  // ── Submit ──────────────────────────────────────────────────────────────────
  const onSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    setImageUploadError(null);

    try {
      let result: ProductWithCategory;

      if (isEdit && product) {
        // ── Edit flow ──────────────────────────────────────────────────────
        let newImageUrl: string | null | undefined = undefined;

        if (imageFile) {
          // Upload new image
          try {
            const { publicUrl } = await uploadProductImage(imageFile, product.id);
            newImageUrl = publicUrl;
            // Delete the old image (non-fatal if it fails)
            if (product.image_url) {
              await deleteProductImageByUrl(product.image_url);
            }
          } catch (uploadErr) {
            const msg =
              uploadErr instanceof Error ? uploadErr.message : "Image upload failed.";
            setImageUploadError(msg);
            setIsSubmitting(false);
            return;
          }
        }

        result = await updateProduct(product.id, {
          name: values.name,
          category_id: values.category_id,
          selling_price: values.selling_price,
          stock: values.stock,
          is_published: values.is_published,
          description: values.description?.trim() || null,
          specifications: values.specifications?.trim() || null,
          ...(newImageUrl !== undefined && { image_url: newImageUrl }),
        });

        toast.success(`"${result.name}" updated successfully.`);
      } else {
        // 1. Create the product with all fields (gets auto-generated product_code from DB)
        result = await createProduct({
          name: values.name,
          category_id: values.category_id,
          selling_price: values.selling_price,
          stock: values.stock,
          image_url: null,
          is_published: values.is_published,
          description: values.description?.trim() || null,
          specifications: values.specifications?.trim() || null,
        });

        // 2. Upload image (if any) using the generated product ID as the folder
        if (imageFile) {
          try {
            const { publicUrl } = await uploadProductImage(imageFile, result.id);
            // 3. Update product with image URL
            result = await updateProduct(result.id, {
              image_url: publicUrl,
            });
          } catch (uploadErr) {
            // Product is created — log image error but don't fail the whole operation
            const msg =
              uploadErr instanceof Error ? uploadErr.message : "Image upload failed.";
            toast.error(`Product created but image could not be uploaded: ${msg}`);
          }
        }

        toast.success(
          `Product "${result.name}" created with code ${result.product_code}.`
        );
      }

      onSuccess(result);
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isSubmitting) onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Product" : "Add Product"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the product details. Product code cannot be changed."
              : "Fill in the product details. A unique product code will be generated automatically by the system."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-5 px-6 py-4">
            {/* Image upload */}
            <div className="space-y-2">
              <Label>Product Image <span className="text-muted-foreground">(optional)</span></Label>
              <ProductImageUpload
                existingUrl={product?.image_url}
                onChange={setImageFile}
                error={imageUploadError ?? undefined}
              />
            </div>

            {/* Product Code display (read-only) */}
            {isEdit && product && (
              <div className="space-y-2">
                <Label>Product Code</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={product.product_code}
                    readOnly
                    className="font-mono bg-muted/50 text-muted-foreground cursor-not-allowed"
                  />
                  <Badge variant="secondary">Auto-generated</Badge>
                </div>
              </div>
            )}

            {!isEdit && (
              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Product Code &amp; Barcode</span>
                  {" "}will be auto-generated by the system (e.g.{" "}
                  <span className="font-mono">BRG000001</span>) after saving. This ensures
                  uniqueness even when multiple administrators work simultaneously.
                </p>
              </div>
            )}

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="product-name">
                Product Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="product-name"
                placeholder="e.g. Wireless Mouse"
                {...register("name")}
                className={cn(errors.name && "border-destructive")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Category + Price in a 2-col grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="product-category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Controller
                  control={control}
                  name="category_id"
                  render={({ field }) => (
                    <Select
                      id="product-category"
                      placeholder="Select a category"
                      error={!!errors.category_id}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </Select>
                  )}
                />
                {errors.category_id && (
                  <p className="text-sm text-destructive">
                    {errors.category_id.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-price">
                  Selling Price <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="product-price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className={cn("pl-7", errors.selling_price && "border-destructive")}
                    {...register("selling_price")}
                  />
                </div>
                {errors.selling_price && (
                  <p className="text-sm text-destructive">
                    {errors.selling_price.message}
                  </p>
                )}
              </div>
            </div>

            {/* Stock */}
            <div className="space-y-2">
              <Label htmlFor="product-stock">
                Initial Stock <span className="text-destructive">*</span>
              </Label>
              <Input
                id="product-stock"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                className={cn("max-w-xs", errors.stock && "border-destructive")}
                {...register("stock")}
              />
              {errors.stock && (
                <p className="text-sm text-destructive">{errors.stock.message}</p>
              )}
            </div>

            {/* ── Publish to Public Catalog ─────────────────────────────── */}
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {isPublished ? (
                      <Globe className="h-4 w-4 text-success flex-shrink-0" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <Label
                      htmlFor="product-is-published"
                      className="font-semibold cursor-pointer"
                    >
                      Publish to Public Catalog
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isPublished
                      ? "This product is visible on the public website catalog."
                      : "This product is hidden from the public catalog. Only admins can see it."}
                  </p>
                </div>
                {/* Native toggle using checkbox styled as a switch */}
                <Controller
                  control={control}
                  name="is_published"
                  render={({ field }) => (
                    <button
                      type="button"
                      id="product-is-published"
                      role="switch"
                      aria-checked={field.value}
                      onClick={() => setValue("is_published", !field.value)}
                      className={cn(
                        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        field.value ? "bg-success" : "bg-input"
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                          field.value ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  )}
                />
              </div>
            </div>

            {/* ── Description ──────────────────────────────────────────── */}
            <div className="space-y-2">
              <Label htmlFor="product-description">
                Description{" "}
                <span className="text-muted-foreground text-xs font-normal">
                  (shown on public catalog)
                </span>
              </Label>
              <textarea
                id="product-description"
                rows={4}
                placeholder="Marketing description visible to customers on the public catalog page…"
                className={cn(
                  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
                  errors.description && "border-destructive"
                )}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* ── Specifications ───────────────────────────────────────── */}
            <div className="space-y-2">
              <Label htmlFor="product-specifications">
                Specifications{" "}
                <span className="text-muted-foreground text-xs font-normal">
                  (technical details, optional)
                </span>
              </Label>
              <textarea
                id="product-specifications"
                rows={4}
                placeholder={"Dimensions: 120 x 60 x 75 cm\nMaterial: Solid Teak\nFinishing: Water-based lacquer\n…"}
                className={cn(
                  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
                  errors.specifications && "border-destructive"
                )}
                {...register("specifications")}
              />
              {errors.specifications && (
                <p className="text-sm text-destructive">{errors.specifications.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
