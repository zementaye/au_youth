"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

type ToastVariant = "success" | "error";
type Toast = { id: number; message: string; variant: ToastVariant };

const ToastContext = createContext<{
  showToast: (message: string, variant?: ToastVariant) => void;
} | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx.showToast;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex max-w-sm items-center gap-2 rounded-lg border px-4 py-2.5 text-sm shadow-lg ${
              t.variant === "success"
                ? "border-sage/30 bg-paper-raised text-ink"
                : "border-coral/30 bg-paper-raised text-ink"
            }`}
          >
            {t.variant === "success" ? (
              <CheckCircle2 size={16} className="shrink-0 text-sage" />
            ) : (
              <XCircle size={16} className="shrink-0 text-coral" />
            )}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
