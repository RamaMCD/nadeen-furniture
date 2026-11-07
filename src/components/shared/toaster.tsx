"use client";

import * as React from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  registerToastListener,
  type ToastPayload,
  type ToastType,
} from "@/lib/toast";

// ─── Single toast item ───────────────────────────────────────────────────────

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />,
  error: <XCircle className="h-4 w-4 shrink-0 text-destructive" />,
  info: <Info className="h-4 w-4 shrink-0 text-primary" />,
};

const bgMap: Record<ToastType, string> = {
  success: "border-success/20 bg-success/5",
  error: "border-destructive/20 bg-destructive/5",
  info: "border-primary/20 bg-primary/5",
};

interface ToastItemProps {
  toast: ToastPayload;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3.5 shadow-soft-lg",
        "animate-fade-in text-sm w-80 max-w-[calc(100vw-2rem)]",
        bgMap[toast.type]
      )}
      role="alert"
    >
      {iconMap[toast.type]}
      <p className="flex-1 leading-snug text-foreground">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="ml-auto shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground focus:outline-none"
        aria-label="Dismiss notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Toaster ─────────────────────────────────────────────────────────────────

const AUTO_DISMISS_MS = 4500;

/**
 * Global toast renderer.
 * Rendered once in the dashboard layout; listens to the toast event bus.
 */
export function Toaster() {
  const [toasts, setToasts] = React.useState<ToastPayload[]>([]);

  React.useEffect(() => {
    const unregister = registerToastListener((payload) => {
      setToasts((prev) => [...prev, payload]);

      // Auto-dismiss after timeout
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== payload.id));
      }, AUTO_DISMISS_MS);
    });

    return unregister;
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (!toasts.length) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  );
}
