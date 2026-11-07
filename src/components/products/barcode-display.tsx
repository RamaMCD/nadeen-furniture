"use client";

import * as React from "react";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BarcodeDisplayProps {
  /** The Code128 value to encode (usually the product_code). */
  value: string;
  /** Displayed above the barcode on the print label. */
  productName?: string;
  /** Displayed below the barcode on the print label (e.g. product code). */
  productCode?: string;
  className?: string;
}

/**
 * Renders a Code128 barcode using JsBarcode on a canvas element.
 *
 * Actions:
 *  - Download PNG  → converts canvas to a PNG blob and triggers a download.
 *  - Print         → opens a new window with a clean label layout and calls
 *                    window.print() automatically.
 *
 * Falls back gracefully if `value` is empty or jsbarcode is unavailable.
 */
export function BarcodeDisplay({
  value,
  productName,
  productCode,
  className,
}: BarcodeDisplayProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (!value || !canvasRef.current) return;

    // Dynamically import jsbarcode to avoid SSR issues
    import("jsbarcode")
      .then(({ default: JsBarcode }) => {
        try {
          JsBarcode(canvasRef.current!, value, {
            format: "CODE128",
            width: 2.2,
            height: 80,
            displayValue: true,
            fontSize: 13,
            fontOptions: "",
            font: "monospace",
            textAlign: "center",
            textPosition: "bottom",
            textMargin: 6,
            background: "#ffffff",
            lineColor: "#0f172a",
            margin: 12,
          });
          setReady(true);
          setError(null);
        } catch {
          setError("Failed to render barcode.");
        }
      })
      .catch(() => setError("Barcode library unavailable."));
  }, [value]);

  // ─── Download PNG ────────────────────────────────────────────────────────
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `barcode-${value}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  // ─── Print ───────────────────────────────────────────────────────────────
  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;

    const dataUrl = canvas.toDataURL("image/png");
    const printWindow = window.open("", "_blank", "width=400,height=300");
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Barcode – ${productName ?? value}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    @page { size: 100mm 60mm; margin: 0; }
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #fff;
      font-family: 'Courier New', Courier, monospace;
    }
    .label {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 12px 16px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }
    .product-name {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.01em;
      text-align: center;
      max-width: 220px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .product-code {
      font-size: 11px;
      color: #64748b;
      letter-spacing: 0.05em;
    }
    .barcode-img { display: block; max-width: 220px; }
    @media print {
      body { min-height: unset; }
      .label { border: none; }
    }
  </style>
</head>
<body>
  <div class="label">
    ${productName ? `<p class="product-name">${productName}</p>` : ""}
    <img class="barcode-img" src="${dataUrl}" alt="Barcode" />
    ${productCode ? `<p class="product-code">${productCode}</p>` : ""}
  </div>
  <script>
    window.onload = function () {
      window.print();
      window.close();
    };
  </script>
</body>
</html>`);
    printWindow.document.close();
  };

  if (!value) {
    return (
      <div
        className={cn(
          "flex h-28 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground",
          className
        )}
      >
        No barcode available
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Canvas */}
      <div className="flex justify-center overflow-hidden rounded-xl border bg-white p-2 shadow-soft">
        <canvas ref={canvasRef} className="max-w-full" />
      </div>

      {error && (
        <p className="text-center text-xs text-destructive">{error}</p>
      )}

      {/* Action buttons */}
      {ready && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
            Download PNG
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4" />
            Print Barcode
          </Button>
        </div>
      )}
    </div>
  );
}
