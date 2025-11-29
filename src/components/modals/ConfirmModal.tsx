// src/components/modals/ConfirmModal.tsx
import React from "react";
import { AlertTriangle } from "lucide-react";

export type ConfirmModalProps = {
  visible: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  /** Si es true, el botón de confirmar se muestra en rojo tipo acción destructiva */
  danger?: boolean;
  /** Para deshabilitar mientras se envía algo */
  loading?: boolean;
};

export default function ConfirmModal({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  danger = false,
  loading = false,
}: ConfirmModalProps) {
  if (!visible) return null;

  const confirmClasses = danger
    ? "bg-red-600 hover:bg-red-700 focus-visible:ring-red-500 dark:bg-red-500 dark:hover:bg-red-400"
    : "bg-brand-500 hover:bg-brand-600 focus-visible:ring-brand-500 dark:bg-brand-500 dark:hover:bg-brand-400";

  const outlineBorder = danger
    ? "border-red-200 text-red-700 hover:border-red-300 dark:border-red-800 dark:text-red-200"
    : "border-gray-300 text-gray-700 hover:border-gray-400 dark:border-gray-700 dark:text-gray-200";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-5 shadow-xl ring-1 ring-gray-100
                   dark:border-gray-800 dark:bg-gray-900 dark:ring-gray-800 sm:p-6"
      >
        {/* Encabezado con ícono */}
        <div className="mb-4 flex items-start gap-3">
          <div
            className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600 shadow-sm
                       dark:bg-amber-900/30 dark:text-amber-300"
          >
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
              {title}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {message}
            </p>
          </div>
        </div>

        {/* Botones */}
        <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className={`inline-flex w-full items-center justify-center rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold
                        shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                        focus-visible:ring-offset-white dark:bg-gray-900 dark:focus-visible:ring-offset-gray-900 sm:w-auto ${outlineBorder}`}
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold
                        text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                        focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 sm:w-auto
                        disabled:cursor-not-allowed disabled:opacity-70 ${confirmClasses}`}
          >
            {loading ? "Procesando..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
