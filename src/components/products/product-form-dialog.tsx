"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ImagePlus, Loader2, Globe, EyeOff, X } from "lucide-react";
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
import { ProductImagesManager } from "@/components/products/product-images-manager";
import { createProduct, getProductById, updateProduct, type ProductWithCategory } from "@/lib/db/products";
import { addProductImage } from "@/lib/db/product-images";
import { formatBytes, optimizeImageForUpload } from "@/lib/images/optimize";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/database";

const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters").max(100, "Product name must be at most 100 characters").trim(),
  category_id: z.string().min(1, "Please select a category"),
  selling_price: z.coerce.number({ invalid_type_error: "Enter a valid price" }).min(0, "Price cannot be negative"),
  stock: z.coerce.number({ invalid_type_error: "Enter a valid quantity" }).int("Stock must be a whole number").min(0, "Stock cannot be negative"),
  is_published: z.boolean(),
  description: z.string().max(2000, "Description must be at most 2000 characters").optional(),
  specifications: z.string().max(2000, "Specifications must be at most 2000 characters").optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface QueuedImage {
  file: File;
  preview: string;
  originalName: string;
  originalSize: number;
  optimizedSize: number;
  wasOptimized: boolean;
}

interface ProductFormDialogProps {
  mode: "add" | "edit";
  product?: ProductWithCategory;
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (product: ProductWithCategory) => void;
}

export function ProductFormDialog({ mode, product, categories, open, onOpenChange, onSuccess }: ProductFormDialogProps) {
  const isEdit = mode === "edit";
  const [queuedImages, setQueuedImages] = React.useState<QueuedImage[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [preparingImages, setPreparingImages] = React.useState(false);
  const [prepareStatus, setPrepareStatus] = React.useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm<ProductFormValues>({
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
      setQueuedImages((prev) => { prev.forEach((q) => URL.revokeObjectURL(q.preview)); return []; });
    }
  }, [open, product, reset]);

  React.useEffect(() => () => { queuedImages.forEach((q) => URL.revokeObjectURL(q.preview)); }, [queuedImages]);

  async function onPickFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    setPreparingImages(true);
    try {
      for (const [index, file] of list.entries()) {
        if (!file.type.startsWith("image/")) {
          toast.error(`"${file.name}" bukan file gambar yang valid.`);
          continue;
        }
        setPrepareStatus(
          `Menyiapkan ${index + 1}/${list.length}: ${file.name} (${formatBytes(file.size)}) — mengoptimalkan...`
        );
        try {
          const optimized = await optimizeImageForUpload(file);
          const preview = URL.createObjectURL(optimized.file);
          setQueuedImages((prev) => [
            ...prev,
            {
              file: optimized.file,
              preview,
              originalName: file.name,
              originalSize: optimized.originalSize,
              optimizedSize: optimized.optimizedSize,
              wasOptimized: optimized.wasOptimized || optimized.optimizedSize !== optimized.originalSize,
            },
          ]);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Gagal memproses gambar.";
          toast.error(`Gambar "${file.name}" tidak dapat diproses: ${msg}`);
        }
      }
    } finally {
      setPreparingImages(false);
      setPrepareStatus(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeQueued(index: number) {
    setQueuedImages((prev) => {
      const item = prev[index];
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  const onSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    setUploadStatus(null);
    try {
      let result: ProductWithCategory;

      if (isEdit && product) {
        result = await updateProduct(product.id, {
          name: values.name,
          category_id: values.category_id,
          selling_price: values.selling_price,
          stock: values.stock,
          is_published: values.is_published,
          description: values.description?.trim() || null,
          specifications: values.specifications?.trim() || null,
        });
        toast.success(`"${result.name}" updated successfully.`);
      } else {
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

        let uploadedCount = 0;
        let firstUploadError: string | null = null;
        for (const [index, item] of queuedImages.entries()) {
          setUploadStatus(
            `Mengunggah ${index + 1}/${queuedImages.length}: ${item.originalName} (${formatBytes(item.optimizedSize)})`
          );
          try {
            await addProductImage({ productId: result.id, file: item.file, makePrimary: index === 0 && uploadedCount === 0 });
            uploadedCount += 1;
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Image upload failed.";
            firstUploadError ??= msg;
            if (msg.toLowerCase().includes("maximum allowed size") || msg.toLowerCase().includes("exceeded")) {
              toast.error(
                `Image ${index + 1} (${item.originalName}, ${formatBytes(item.optimizedSize)}) terlalu besar untuk batas Storage saat ini: ${msg}. Jalankan migration 20261110_0011_product_images_bucket_limits.sql di Supabase.`
              );
            } else {
              toast.error(`Image ${index + 1} (${item.originalName}) could not be uploaded: ${msg}`);
            }
          }
        }
        if (queuedImages.length > 0) {
          const refreshed = await getProductById(result.id);
          if (refreshed) result = refreshed;
        }
        if (queuedImages.length === 0) {
          toast.success(`Product "${result.name}" created with code ${result.product_code}.`);
        } else if (uploadedCount === queuedImages.length) {
          toast.success(`Product "${result.name}" created with ${uploadedCount} image${uploadedCount === 1 ? "" : "s"}.`);
        } else if (uploadedCount > 0) {
          toast.success(`Product "${result.name}" created. Uploaded ${uploadedCount}/${queuedImages.length} images.`);
        } else {
          toast.success(`Product "${result.name}" created with code ${result.product_code}, but no images were uploaded.`);
          if (firstUploadError && (firstUploadError.includes("schema cache") || firstUploadError.includes("product_images"))) {
            toast.error("Product gallery not ready. Apply migration 20261110_0010_fix_product_images_gallery.sql in Supabase, then reload the PostgREST schema cache.");
          }
        }
      }

      onSuccess(result);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
      setUploadStatus(null);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isSubmitting && !preparingImages) onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Product" : "Add Product"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update product details and manage all product images."
              : "Fill in product details. You can select multiple images now; they will be uploaded after the product is created."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-5 px-6 py-4">
            <div className="space-y-2">
              <Label>Product Images <span className="font-normal text-muted-foreground">(multiple supported)</span></Label>
              {isEdit && product?.id ? (
                <ProductImagesManager productId={product.id} />
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={preparingImages || isSubmitting}>
                      {preparingImages ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                      {preparingImages ? "Optimizing..." : "Select Images"}
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {queuedImages.length} selected · first image becomes primary · large photos are auto-optimized before upload
                    </span>
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="hidden" onChange={(e) => void onPickFiles(e.target.files)} />
                  </div>

                  {prepareStatus && (
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span className="truncate">{prepareStatus}</span>
                    </div>
                  )}

                  {uploadStatus && (
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span className="truncate">{uploadStatus}</span>
                    </div>
                  )}

                  {queuedImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                      {queuedImages.map((item, idx) => (
                        <div key={item.preview} className="relative overflow-hidden rounded-lg border bg-[#FAF8F4]">
                          <div className="aspect-[4/3]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.preview} alt={`Selected ${idx + 1}`} className="h-full w-full object-contain p-1.5" />
                          </div>
                          {idx === 0 && <span className="absolute left-1 top-1 rounded bg-[#C5A46D] px-1.5 py-0.5 text-[9px] font-semibold text-white">Primary</span>}
                          <button type="button" onClick={() => removeQueued(idx)} disabled={isSubmitting || preparingImages} className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white disabled:opacity-50" aria-label="Remove selected image">
                            <X className="h-3 w-3" />
                          </button>
                          <div className="border-t border-border/60 bg-white/70 px-2 py-1.5">
                            <p className="truncate text-[10px] font-medium text-foreground" title={item.originalName}>{item.originalName}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {formatBytes(item.originalSize)}
                              {item.wasOptimized ? ` → ${formatBytes(item.optimizedSize)}` : " (siap)"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {isEdit && product && (
              <div className="space-y-2">
                <Label>Product Code</Label>
                <div className="flex items-center gap-2">
                  <Input value={product.product_code} readOnly className="cursor-not-allowed bg-muted/50 font-mono text-muted-foreground" />
                  <Badge variant="secondary">Auto-generated</Badge>
                </div>
              </div>
            )}

            {!isEdit && (
              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Product Code &amp; Barcode</span> will be auto-generated by the system (e.g. <span className="font-mono">BRG000001</span>) after saving.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="product-name">Product Name <span className="text-destructive">*</span></Label>
              <Input id="product-name" placeholder="e.g. Wireless Mouse" {...register("name")} className={cn(errors.name && "border-destructive")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="product-category">Category <span className="text-destructive">*</span></Label>
                <Controller control={control} name="category_id" render={({ field }) => (
                  <Select id="product-category" placeholder="Select a category" error={!!errors.category_id} value={field.value} onChange={field.onChange} onBlur={field.onBlur}>
                    {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                  </Select>
                )} />
                {errors.category_id && <p className="text-sm text-destructive">{errors.category_id.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-price">Selling Price <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                  <Input id="product-price" type="number" step="0.01" min="0" placeholder="0.00" className={cn("pl-7", errors.selling_price && "border-destructive")} {...register("selling_price")} />
                </div>
                {errors.selling_price && <p className="text-sm text-destructive">{errors.selling_price.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-stock">Initial Stock <span className="text-destructive">*</span></Label>
              <Input id="product-stock" type="number" min="0" step="1" placeholder="0" className={cn("max-w-xs", errors.stock && "border-destructive")} {...register("stock")} />
              {errors.stock && <p className="text-sm text-destructive">{errors.stock.message}</p>}
            </div>

            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    {isPublished ? <Globe className="h-4 w-4 flex-shrink-0 text-success" /> : <EyeOff className="h-4 w-4 flex-shrink-0 text-muted-foreground" />}
                    <Label htmlFor="product-is-published" className="cursor-pointer font-semibold">Publish to Public Catalog</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">{isPublished ? "This product is visible on the public website catalog." : "This product is hidden from the public catalog. Only admins can see it."}</p>
                </div>
                <Controller control={control} name="is_published" render={({ field }) => (
                  <button type="button" id="product-is-published" role="switch" aria-checked={field.value} onClick={() => setValue("is_published", !field.value)} className={cn("relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", field.value ? "bg-success" : "bg-input")}>
                    <span aria-hidden="true" className={cn("pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out", field.value ? "translate-x-5" : "translate-x-0")} />
                  </button>
                )} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-description">Description <span className="text-xs font-normal text-muted-foreground">(shown on public catalog)</span></Label>
              <textarea id="product-description" rows={4} placeholder="Marketing description visible to customers on the public catalog page…" className={cn("flex w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", errors.description && "border-destructive")} {...register("description")} />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-specifications">Specifications <span className="text-xs font-normal text-muted-foreground">(technical details, optional)</span></Label>
              <textarea id="product-specifications" rows={4} placeholder={"Dimensions: 120 x 60 x 75 cm\nMaterial: Solid Teak\nFinishing: Water-based lacquer\n…"} className={cn("flex w-full resize-none rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", errors.specifications && "border-destructive")} {...register("specifications")} />
              {errors.specifications && <p className="text-sm text-destructive">{errors.specifications.message}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting || preparingImages}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || preparingImages}>
              {(isSubmitting || preparingImages) && <Loader2 className="h-4 w-4 animate-spin" />}
              {preparingImages ? "Preparing Images..." : isEdit ? "Save Changes" : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
