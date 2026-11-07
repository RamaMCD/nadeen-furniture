"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
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
import { createCategory, updateCategory } from "@/lib/db/categories";
import { toast } from "@/lib/toast";
import type { Category } from "@/types/database";

// ─── Validation ──────────────────────────────────────────────────────────────

const categorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name must be at most 50 characters")
    .trim(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

// ─── Props ───────────────────────────────────────────────────────────────────

interface CategoryFormDialogProps {
  mode: "add" | "edit";
  category?: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful create or update, with the new/updated category. */
  onSuccess: (category: Category) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CategoryFormDialog({
  mode,
  category,
  open,
  onOpenChange,
  onSuccess,
}: CategoryFormDialogProps) {
  const isEdit = mode === "edit";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: category?.name ?? "" },
  });

  // Sync default values when the dialog opens for a different category
  React.useEffect(() => {
    if (open) {
      reset({ name: category?.name ?? "" });
    }
  }, [open, category, reset]);

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      let result: Category;

      if (isEdit && category) {
        result = await updateCategory(category.id, values.name);
        toast.success(`Category "${result.name}" updated successfully.`);
      } else {
        result = await createCategory(values.name);
        toast.success(`Category "${result.name}" created successfully.`);
      }

      onSuccess(result);
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      toast.error(message);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(nextOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Category" : "Add Category"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the category name. This change will reflect on all products in this category."
              : "Create a new category to organise your products."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4 px-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                placeholder="e.g. Electronics"
                autoComplete="off"
                autoFocus
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
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
              {isEdit ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
