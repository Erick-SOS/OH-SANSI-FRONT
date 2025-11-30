// src/components/ui/modals/ResultModal.tsx
import { CheckCircle2, XCircle } from "lucide-react";

const colorByType = {
  success: {
    icon: CheckCircle2,
    ring: "ring-green-100 dark:ring-green-900/40",
    iconBg: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300",
    title: "text-green-700 dark:text-green-200",
    button:
      "bg-green-600 hover:bg-green-700 focus-visible:ring-green-500 dark:bg-green-500 dark:hover:bg-green-400",
  },
  error: {
    icon: XCircle,
    ring: "ring-red-100 dark:ring-red-900/40",
    iconBg: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300",
    title: "text-red-700 dark:text-red-200",
    button:
      "bg-red-600 hover:bg-red-700 focus-visible:ring-red-500 dark:bg-red-500 dark:hover:bg-red-400",
  },
};

export type ResultModalProps = {
  visible: boolean;
  type: "success" | "error";
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
};

export default function ResultModal({
  visible,
  type,
  title,
  message,
  buttonText = "Aceptar",
  onClose,
}: ResultModalProps) {
  if (!visible) return null;

  const cfg = colorByType[type];
  const Icon = cfg.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`w-full max-w-md rounded-2xl border border-gray-100 bg-white p-5 shadow-xl ring-1
                    dark:border-gray-800 dark:bg-gray-900 sm:p-6 ${cfg.ring}`}
      >
        {/* Icono */}
        <div className="mb-4 flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-full shadow-sm ${cfg.iconBg}`}
          >
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2
            className={`text-base font-semibold sm:text-lg ${cfg.title}`}
          >
            {title}
          </h2>
        </div>

        {/* Mensaje */}
        <p className="mb-6 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          {message}
        </p>

        {/* Botón */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold
                        text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                        focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 sm:w-auto ${cfg.button}`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
