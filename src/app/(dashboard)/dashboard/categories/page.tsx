"use client";

import * as React from "react";
import { Tags, Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { getCategories, deleteCategory, type CategoryWithCount } from "@/lib/db/categories";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { CategoryFormDialog } from "@/components/categories/category-form-dialog";
import type { Category } from "@/types/database";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-border animate-pulse">
      <td className="px-6 py-4"><div className="h-4 w-40 rounded bg-muted" /></td>
      <td className="px-6 py-4"><div className="h-5 w-12 rounded-full bg-muted" /></td>
      <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-muted" /></td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <div className="h-8 w-16 rounded-md bg-muted" />
          <div className="h-8 w-16 rounded-md bg-muted" />
        </div>
      </td>
    </tr>
  );
}

// ─── Page component ───────────────────────────────────────────────────────────

export default function CategoriesPage() {
  // ── Data state ──────────────────────────────────────────────────────────────
  const [categories, setCategories] = React.useState<CategoryWithCount[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [search, setSearch] = React.useState("");

  // Add / Edit dialog
  const [formDialog, setFormDialog] = React.useState<{
    open: boolean;
    mode: "add" | "edit";
    category?: Category;
  }>({ open: false, mode: "add" });

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = React.useState<{
    open: boolean;
    category?: CategoryWithCount;
  }>({ open: false });
  const [isDeleting, setIsDeleting] = React.useState(false);

  // ── Load categories ─────────────────────────────────────────────────────────
  const loadCategories = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load categories.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // ── Filtered list ───────────────────────────────────────────────────────────
  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(term));
  }, [categories, search]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleFormSuccess = (category: Category) => {
    // Optimistically update/insert in local list
    setCategories((prev) => {
      const exists = prev.find((c) => c.id === category.id);
      if (exists) {
        return prev.map((c) =>
          c.id === category.id ? { ...c, name: category.name } : c
        );
      }
      return [
        { ...category, product_count: 0 },
        ...prev,
      ].sort((a, b) => a.name.localeCompare(b.name));
    });
  };

  const openAdd = () => setFormDialog({ open: true, mode: "add" });

  const openEdit = (category: Category) =>
    setFormDialog({ open: true, mode: "edit", category });

  const openDelete = (category: CategoryWithCount) =>
    setDeleteDialog({ open: true, category });

  const handleDelete = async () => {
    if (!deleteDialog.category) return;
    setIsDeleting(true);
    try {
      await deleteCategory(deleteDialog.category.id);
      toast.success(`Category "${deleteDialog.category.name}" deleted.`);
      setCategories((prev) =>
        prev.filter((c) => c.id !== deleteDialog.category!.id)
      );
      setDeleteDialog({ open: false });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete category.");
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
          <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Organise your products into categories
          </p>
        </div>
        <Button onClick={openAdd} className="mt-3 sm:mt-0">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search categories…"
          className="max-w-xs"
        />
        {!isLoading && (
          <span className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "category" : "categories"}
          </span>
        )}
      </div>

      {/* Table card */}
      <Card>
        <CardHeader className="border-b border-border px-6 py-4">
          <CardTitle>All Categories</CardTitle>
          <CardDescription>
            Deleting a category that still has products assigned is not allowed.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {/* Loading skeleton */}
          {isLoading ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">Products</th>
                    <th className="px-6 py-3 font-medium">Created</th>
                    <th className="px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-8">
              <EmptyState
                icon={<Tags className="h-7 w-7" />}
                title={search ? "No categories match your search" : "No categories yet"}
                description={
                  search
                    ? `Try a different search term.`
                    : "Add your first category to start organising products."
                }
                action={
                  !search ? (
                    <Button size="sm" onClick={openAdd}>
                      <Plus className="h-4 w-4" />
                      Add Category
                    </Button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">Products</th>
                    <th className="px-6 py-3 font-medium">Created</th>
                    <th className="px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((category) => (
                    <tr
                      key={category.id}
                      className="border-b border-border last:border-0 transition-colors hover:bg-muted/40"
                    >
                      <td className="px-6 py-3.5 font-medium">{category.name}</td>
                      <td className="px-6 py-3.5">
                        <Badge variant="secondary">
                          {category.product_count}
                        </Badge>
                      </td>
                      <td className="px-6 py-3.5 text-muted-foreground">
                        {formatDate(category.created_at)}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(category)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive"
                            onClick={() => openDelete(category)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CategoryFormDialog
        mode={formDialog.mode}
        category={formDialog.category}
        open={formDialog.open}
        onOpenChange={(open) => setFormDialog((prev) => ({ ...prev, open }))}
        onSuccess={handleFormSuccess}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
        title="Delete Category"
        description={
          deleteDialog.category
            ? `Are you sure you want to delete "${deleteDialog.category.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this category?"
        }
        confirmLabel="Delete Category"
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </div>
  );
}
