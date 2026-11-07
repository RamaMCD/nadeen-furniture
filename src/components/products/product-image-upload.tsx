"use client";

import * as React from "react";
import Image from "next/image";
import { ImagePlus, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

interface ProductImageUploadProps {
  /** Current image URL (from DB) — shown when no new file is selected. */
  existingUrl?: string | null;
  /** Called whenever the user picks or removes an image. */
  onChange: (file: File | null) => void;
  error?: string;
}

/**
 * Product image upload area.
 *
 * - Click or drag-and-drop to select a new image.
 * - Shows a live preview of the selected file using createObjectURL.
 * - Falls back to the existing DB image URL when editing a product.
 * - Validates file type (JPG/PNG/WebP) and size (≤ 2 MB) before accepting.
 * - Remove button clears the selection and reverts to the existing URL (if any).
 */
export function ProductImageUpload({
  existingUrl,
  onChange,
  error,
}: ProductImageUploadProps) {
  const [preview, setPreview] = React.useState<string | null>(existingUrl ?? null);
  const [localFile, setLocalFile] = React.useState<File | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Keep preview in sync when existingUrl changes (e.g. dialog re-opens for different product)
  React.useEffect(() => {
    if (!localFile) {
      setPreview(existingUrl ?? null);
    }
  }, [existingUrl, localFile]);

  // Revoke object URLs to prevent memory leaks
  React.useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const validate = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Only JPG, PNG, and WebP images are accepted.";
    }
    if (file.size > MAX_SIZE_BYTES) {
      return "Image must be smaller than 2 MB.";
    }
    return null;
  };

  const accept = (file: File) => {
    const err = validate(file);
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError(null);
    const objectUrl = URL.createObjectURL(file);
    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    setPreview(objectUrl);
    setLocalFile(file);
    onChange(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) accept(file);
    // Reset input so selecting the same file again triggers onChange
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) accept(file);
  };

  const handleRemove = () => {
    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    setPreview(existingUrl ?? null);
    setLocalFile(null);
    setValidationError(null);
    onChange(null);
  };

  const displayError = validationError ?? error;

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "relative flex h-44 w-full cursor-pointer flex-col items-center justify-center",
          "rounded-xl border-2 border-dashed transition-colors",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/30",
          displayError && "border-destructive"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        aria-label="Upload product image"
      >
        {preview ? (
          <>
            <Image
              src={preview}
              alt="Product preview"
              fill
              className="rounded-[10px] object-contain p-2"
              sizes="(max-width: 640px) 100vw, 320px"
              unoptimized={preview.startsWith("blob:")}
            />
            {/* Remove button */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleRemove(); }}
              className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow transition-opacity hover:opacity-90"
              aria-label="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <ImagePlus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Click or drag to upload
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, WebP · Max 2 MB
              </p>
            </div>
          </div>
        )}
      </div>

      {displayError && (
        <div className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {displayError}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="sr-only"
        onChange={handleFileChange}
        aria-label="Product image file input"
      />
    </div>
  );
}
