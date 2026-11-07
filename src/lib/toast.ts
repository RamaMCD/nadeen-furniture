/**
 * Toast event bus — a lightweight, dependency-free notification system.
 *
 * Pattern:
 *  1. The <Toaster> component (rendered once in the dashboard layout) calls
 *     `registerToastListener` on mount and unregisters on unmount.
 *  2. Any module calls `toast.success(msg)` / `toast.error(msg)` to emit an
 *     event that the Toaster picks up and renders.
 *
 * This avoids React Context or any additional runtime dependency.
 */

export type ToastType = "success" | "error" | "info";

export interface ToastPayload {
  id: string;
  type: ToastType;
  message: string;
}

type ToastListener = (payload: ToastPayload) => void;

let _listener: ToastListener | null = null;

export function registerToastListener(fn: ToastListener): () => void {
  _listener = fn;
  return () => {
    _listener = null;
  };
}

function emit(type: ToastType, message: string): void {
  if (!_listener) return;
  const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  _listener({ id, type, message });
}

export const toast = {
  success: (message: string) => emit("success", message),
  error: (message: string) => emit("error", message),
  info: (message: string) => emit("info", message),
};
