"use client";

import * as React from "react";
import { Camera, X, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BarcodeScannerProps {
  /** Called with the decoded barcode string when a scan is successful. */
  onScan: (barcode: string) => void;
  disabled?: boolean;
  className?: string;
}

type ScannerState = "idle" | "initializing" | "scanning" | "error";

/**
 * Camera barcode scanner using html5-qrcode.
 *
 * Key fix: `stop()` must NOT be called synchronously inside the scan-success
 * callback — html5-qrcode is mid-frame at that moment and throws
 * "Cannot stop, scanner is not running or paused".
 * We defer the stop with `setTimeout(..., 0)` so it runs after the
 * current call stack clears, and guard with `isStopping` to prevent
 * double-stop races.
 */
export function BarcodeScanner({ onScan, disabled, className }: BarcodeScannerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [state, setState] = React.useState<ScannerState>("idle");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scannerRef = React.useRef<any>(null);
  /** Guard: prevents stop() from being called twice simultaneously. */
  const isStoppingRef = React.useRef(false);
  /** Stores the scanned value so the deferred callback can access it. */
  const pendingScanRef = React.useRef<string | null>(null);

  const scannerContainerId = "html5-qrcode-scanner-container";

  // ─── Safe stop ───────────────────────────────────────────────────────────
  /**
   * Stops the scanner safely. Always returns a Promise so callers can await it.
   * Silently ignores "not running" errors — these are benign race conditions.
   */
  const safeStop = React.useCallback(async () => {
    if (!scannerRef.current || isStoppingRef.current) return;
    isStoppingRef.current = true;
    try {
      await scannerRef.current.stop();
    } catch {
      // "Cannot stop, scanner is not running or paused" — safe to ignore
    } finally {
      scannerRef.current = null;
      isStoppingRef.current = false;
    }
  }, []);

  // ─── Close modal (called by user or after scan) ───────────────────────────
  const closeModal = React.useCallback(
    async (scannedValue?: string) => {
      await safeStop();
      setIsOpen(false);
      setState("idle");
      setErrorMsg(null);
      if (scannedValue) {
        onScan(scannedValue);
      }
    },
    [safeStop, onScan]
  );

  // ─── Start scanner ───────────────────────────────────────────────────────
  const startScanner = React.useCallback(async () => {
    // Reset stopping guard in case of retry
    isStoppingRef.current = false;
    pendingScanRef.current = null;
    setState("initializing");
    setErrorMsg(null);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const qrCode = new Html5Qrcode(scannerContainerId);
      scannerRef.current = qrCode;

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        throw new Error("No camera device found on this device.");
      }

      // Prefer rear/environment camera on mobile
      const cameraId =
        cameras.find((c: { id: string; label: string }) =>
          /back|rear|environment/i.test(c.label)
        )?.id ?? cameras[cameras.length - 1].id;

      await qrCode.start(
        cameraId,
        {
          fps: 15,
          qrbox: { width: 260, height: 180 },
          aspectRatio: 1.5,
        },
        (decodedText: string) => {
          // ⚠️  IMPORTANT: Do NOT call stop() synchronously here.
          // html5-qrcode is mid-frame processing; calling stop() now causes
          // "Cannot stop, scanner is not running or paused".
          // Defer to the next event loop tick so the frame finishes first.
          if (pendingScanRef.current) return; // already handled
          pendingScanRef.current = decodedText;
          setTimeout(() => {
            closeModal(decodedText);
          }, 0);
        },
        // Per-frame decode failures are normal (no code in view) — suppress
        () => {}
      );

      setState("scanning");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Camera could not be accessed.";
      setErrorMsg(
        msg.toLowerCase().includes("permission")
          ? "Camera permission denied. Please allow camera access in your browser settings."
          : msg
      );
      setState("error");
      scannerRef.current = null;
    }
  }, [closeModal]);

  // ─── Open modal ──────────────────────────────────────────────────────────
  const handleOpen = () => {
    setIsOpen(true);
  };

  // ─── Close via UI ─────────────────────────────────────────────────────────
  const handleClose = React.useCallback(() => {
    closeModal();
  }, [closeModal]);

  // Start scanner after modal container is mounted (small delay for DOM paint)
  React.useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => startScanner(), 150);
    return () => clearTimeout(timer);
  }, [isOpen, startScanner]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      safeStop();
    };
  }, [safeStop]);

  // Close on Escape
  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, handleClose]);

  return (
    <>
      {/* Trigger button */}
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={handleOpen}
        className={cn(
          "h-12 gap-2.5 border-2 border-dashed border-primary/40 bg-primary/5 px-6",
          "text-primary hover:border-primary/70 hover:bg-primary/10",
          "transition-all duration-200",
          className
        )}
      >
        <Camera className="h-5 w-5" />
        Scan Barcode
      </Button>

      {/* Modal overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="relative mx-4 w-full max-w-md rounded-2xl bg-card p-6 shadow-soft-lg">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Scan Barcode</h2>
                <p className="text-sm text-muted-foreground">
                  Point your camera at a barcode
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                aria-label="Close scanner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scanner viewport */}
            <div
              className={cn(
                "relative overflow-hidden rounded-xl border-2 bg-black",
                state === "scanning" ? "border-primary" : "border-border"
              )}
              style={{ minHeight: 260 }}
            >
              {/* html5-qrcode renders its video feed into this div */}
              <div id={scannerContainerId} className="w-full" />

              {/* Scanning frame overlay */}
              {state === "scanning" && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="relative h-44 w-64">
                    <span className="absolute left-0 top-0 h-7 w-7 rounded-tl-sm border-l-2 border-t-2 border-primary" />
                    <span className="absolute right-0 top-0 h-7 w-7 rounded-tr-sm border-r-2 border-t-2 border-primary" />
                    <span className="absolute bottom-0 left-0 h-7 w-7 rounded-bl-sm border-b-2 border-l-2 border-primary" />
                    <span className="absolute bottom-0 right-0 h-7 w-7 rounded-br-sm border-b-2 border-r-2 border-primary" />
                    <div className="absolute left-2 right-2 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-primary/70 animate-pulse" />
                  </div>
                </div>
              )}

              {/* Initializing overlay */}
              {state === "initializing" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 text-white">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm font-medium">Starting camera…</p>
                </div>
              )}

              {/* Error overlay */}
              {state === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/90 p-6 text-center">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                  <p className="text-sm font-semibold text-white">Camera Error</p>
                  <p className="text-xs text-white/60">{errorMsg}</p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => startScanner()}
                    className="mt-1"
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </div>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Press{" "}
              <kbd className="rounded border px-1.5 py-0.5 font-mono text-xs">
                Esc
              </kbd>{" "}
              or tap outside to close
            </p>
          </div>
        </div>
      )}
    </>
  );
}
