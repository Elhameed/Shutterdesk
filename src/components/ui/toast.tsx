import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import type { ToastVariant } from "@/lib/notification-toast";
import { cn } from "@/lib/utils";

const DEFAULT_DURATION_MS = 5_000;
const MAX_VISIBLE_TOASTS = 4;

export type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  href?: string;
  actionLabel?: string;
  duration?: number;
};

type ToastRecord = ToastInput & {
  id: string;
};

type ToastContextValue = {
  push: (toast: ToastInput) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function createToastId() {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const variantStyles: Record<
  ToastVariant,
  { container: string; icon: string; Icon: typeof Info }
> = {
  success: {
    container: "border-emerald-200 bg-emerald-50",
    icon: "text-emerald-600",
    Icon: CheckCircle2,
  },
  info: {
    container: "border-gold/30 bg-white",
    icon: "text-gold",
    Icon: Info,
  },
  warning: {
    container: "border-amber-200 bg-amber-50",
    icon: "text-amber-600",
    Icon: AlertTriangle,
  },
  error: {
    container: "border-red-200 bg-red-50",
    icon: "text-red-600",
    Icon: AlertCircle,
  },
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastRecord;
  onDismiss: (id: string) => void;
}) {
  const variant = toast.variant ?? "info";
  const styles = variantStyles[variant];
  const Icon = styles.Icon;

  useEffect(() => {
    const duration = toast.duration ?? DEFAULT_DURATION_MS;
    const timer = window.setTimeout(() => onDismiss(toast.id), duration);
    return () => window.clearTimeout(timer);
  }, [onDismiss, toast.duration, toast.id]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "toast-enter pointer-events-auto w-full max-w-sm rounded-xl border p-4 shadow-elevated",
        styles.container,
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-0.5 size-5 shrink-0", styles.icon)} aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-charcoal">{toast.title}</p>
          {toast.description ? (
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {toast.description}
            </p>
          ) : null}
          {toast.href && toast.actionLabel ? (
            <Link
              to={toast.href}
              className="mt-2 inline-flex text-sm font-semibold text-gold hover:text-gold-hover"
              onClick={() => onDismiss(toast.id)}
            >
              {toast.actionLabel}
            </Link>
          ) : null}
        </div>
        <button
          type="button"
          className="shrink-0 rounded-md p-1 text-muted transition-colors hover:bg-black/5 hover:text-charcoal"
          aria-label="Dismiss notification"
          onClick={() => onDismiss(toast.id)}
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}

function ToastViewport({ toasts, onDismiss }: {
  toasts: ToastRecord[];
  onDismiss: (id: string) => void;
}) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      aria-label="Notifications"
      className="pointer-events-none fixed top-4 right-4 z-[100] flex w-[min(100vw-2rem,24rem)] flex-col gap-3"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body,
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback((input: ToastInput) => {
    const toast: ToastRecord = {
      ...input,
      id: createToastId(),
      variant: input.variant ?? "info",
    };

    setToasts((current) => {
      const next = [...current, toast];
      if (next.length <= MAX_VISIBLE_TOASTS) {
        return next;
      }
      return next.slice(next.length - MAX_VISIBLE_TOASTS);
    });
  }, []);

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
