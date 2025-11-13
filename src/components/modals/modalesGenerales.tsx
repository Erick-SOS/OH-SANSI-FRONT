// src/components/modals/modalesGenerales.tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/* =========================
   Tipos y utilidades
   ========================= */

type TipoModal =
  | "confirmacion"
  | "eliminacion"
  | "exito"
  | "error"
  | "advertencia"
  | "proceso";

type OpcionesModal = {
  tipo?: TipoModal;
  titulo?: string;
  mensaje?: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  mostrarCancelar?: boolean;
  bloquearCierre?: boolean;
  autoCerrarMs?: number;
  onConfirmar?: () => void | Promise<void>;
  onCancelar?: () => void | Promise<void>;
};

type EstadoInterno = OpcionesModal & {
  visible: boolean;
  resolver?: (v: boolean) => void;
};

type Ctx = {
  abrir: (opciones?: OpcionesModal) => Promise<boolean>;
  cerrar: (confirmado: boolean) => void;
  confirmar: (o?: OpcionesModal) => Promise<boolean>;
  eliminar: (o?: OpcionesModal) => Promise<boolean>;
  exito: (o?: OpcionesModal) => Promise<boolean>;
  error: (o?: OpcionesModal) => Promise<boolean>;
  advertir: (o?: OpcionesModal) => Promise<boolean>;
  proceso: (o?: OpcionesModal) => Promise<boolean>;
};

const ModalContext = createContext<Ctx | null>(null);

/* =========================
   Íconos (SVG inline, sin dependencias)
   ========================= */

const Icono = ({ tipo }: { tipo: TipoModal }) => {
  const map: Record<TipoModal, { className: string; path: ReactNode }> = {
    exito: {
      className: "text-success-600 dark:text-success-400",
      path: (
        <path
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 6L9 17l-4-4"
        />
      ),
    },
    error: {
      className: "text-error-600 dark:text-error-400",
      path: (
        <>
          <path
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            d="M15 9l-6 6M9 9l6 6"
          />
        </>
      ),
    },
    advertencia: {
      className: "text-warning-600 dark:text-warning-400",
      path: (
        <>
          <path
            d="M12 9v4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="12" cy="17" r="1.1" fill="currentColor" />
        </>
      ),
    },
    confirmacion: {
      className: "text-brand-600 dark:text-brand-400",
      path: (
        <>
          <path
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h8M12 8v8"
          />
        </>
      ),
    },
    eliminacion: {
      className: "text-error-600 dark:text-error-400",
      path: (
        <>
          <path
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            d="M10 11v6M14 11v6"
          />
          <path
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 7h12M9 7l1-2h4l1 2M8 7l-1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2L16 7"
          />
        </>
      ),
    },
    proceso: {
      className: "text-blue-light-600 dark:text-blue-light-400",
      path: (
        <>
          <circle
            cx="12"
            cy="12"
            r="8"
            stroke="currentColor"
            strokeWidth="1.8"
            opacity="0.25"
          />
          <path
            d="M12 4a8 8 0 0 1 8 8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </>
      ),
    },
  };

  const { className, path } = map[tipo];
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={`mx-auto mb-4 size-12 ${className}`}
      fill="none"
    >
      {path}
    </svg>
  );
};

/* =========================
   Componente Modal
   ========================= */

function ModalBase({
  estado,
  onFondo,
  onConfirmar,
  onCancelar,
}: {
  estado: EstadoInterno;
  onFondo: () => void;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  const {
    tipo = "confirmacion",
    titulo,
    mensaje,
    textoConfirmar,
    textoCancelar,
    mostrarCancelar,
    bloquearCierre,
  } = estado;

  const estilosTipo: Record<
    TipoModal,
    { boton: string; sombra: string; chip: string }
  > = {
    exito: {
      boton:
        "bg-success-600 hover:bg-success-700 text-white dark:bg-success-600 dark:hover:bg-success-700",
      sombra: "shadow-theme-lg",
      chip: "text-success-700 bg-success-50 dark:text-success-300 dark:bg-success-700/20",
    },
    error: {
      boton:
        "bg-error-600 hover:bg-error-700 text-white dark:bg-error-600 dark:hover:bg-error-700",
      sombra: "shadow-theme-lg",
      chip: "text-error-700 bg-error-50 dark:text-error-300 dark:bg-error-700/20",
    },
    advertencia: {
      boton:
        "bg-warning-600 hover:bg-warning-700 text-white dark:bg-warning-600 dark:hover:bg-warning-700",
      sombra: "shadow-theme-lg",
      chip: "text-warning-700 bg-warning-50 dark:text-warning-300 dark:bg-warning-700/20",
    },
    confirmacion: {
      boton:
        "bg-brand-600 hover:bg-brand-700 text-white dark:bg-brand-600 dark:hover:bg-brand-700",
      sombra: "shadow-theme-lg",
      chip: "text-brand-700 bg-brand-50 dark:text-brand-300 dark:bg-brand-700/20",
    },
    eliminacion: {
      boton:
        "bg-error-600 hover:bg-error-700 text-white dark:bg-error-600 dark:hover:bg-error-700",
      sombra: "shadow-theme-lg",
      chip: "text-error-700 bg-error-50 dark:text-error-300 dark:bg-error-700/20",
    },
    proceso: {
      boton:
        "bg-blue-light-600 hover:bg-blue-light-700 text-white dark:bg-blue-light-600 dark:hover:bg-blue-light-700",
      sombra: "shadow-theme-lg",
      chip: "text-blue-light-700 bg-blue-light-50 dark:text-blue-light-300 dark:bg-blue-light-700/20",
    },
  };

  const tConfirm = textoConfirmar ?? {
    exito: "Aceptar",
    error: "Entendido",
    advertencia: "Entendido",
    confirmacion: "Confirmar",
    eliminacion: "Eliminar",
    proceso: "Procesando...",
  }[tipo];

  const tCancel =
    textoCancelar ?? (tipo === "proceso" ? "Cancelar" : "Cancelar");

  const mostrarBtnCancelar =
    mostrarCancelar ?? (tipo !== "exito" && tipo !== "proceso");

  const tituloDef = {
    exito: "Operación exitosa",
    error: "Ocurrió un error",
    advertencia: "Advertencia",
    confirmacion: "Confirmar acción",
    eliminacion: "Confirmar eliminación",
    proceso: "Procesando",
  }[tipo];

  const mensajeDef = {
    exito: "La acción se completó correctamente.",
    error: "Revise e intente nuevamente.",
    advertencia: "Revise antes de continuar.",
    confirmacion: "¿Desea continuar?",
    eliminacion: "¿Está seguro de eliminar? Esta acción no se puede deshacer.",
    proceso: "Espere un momento…",
  }[tipo];

  return (
    <div
      className={`fixed inset-0 z-[var(--z-index-9999)] ${
        estado.visible ? "opacity-100" : "opacity-0 pointer-events-none"
      } transition-opacity duration-200`}
    >
      {/* Fondo */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-200"
        onClick={() => (bloquearCierre ? null : onFondo())}
      />
      {/* Contenedor */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className={`w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-theme-xl transition-all duration-200 dark:border-gray-800 dark:bg-gray-900 ${estilosTipo[tipo].sombra}`}
        >
          <Icono tipo={tipo} />
          <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
            {titulo ?? tituloDef}
          </h3>
          <p className="mx-auto mb-6 max-w-[36ch] text-sm text-gray-600 dark:text-gray-400">
            {mensaje ?? mensajeDef}
          </p>

          <div className="mb-5">
            <span
              className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${estilosTipo[tipo].chip}`}
            >
              {tipo}
            </span>
          </div>

          <div className="flex items-center justify-center gap-3">
            {mostrarBtnCancelar && (
              <button
                type="button"
                onClick={onCancelar}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/5"
              >
                {tCancel}
              </button>
            )}

            <button
              type="button"
              onClick={onConfirmar}
              disabled={tipo === "proceso"}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium shadow-theme-xs ${estilosTipo[tipo].boton} disabled:opacity-60`}
            >
              {tConfirm}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Proveedor y lógica
   ========================= */

export function ModalProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoInterno>({
    visible: false,
    tipo: "confirmacion",
    mostrarCancelar: true,
  });

  const ultimoFocus = useRef<HTMLElement | null>(null);

  const cerrarInterno = useCallback(async (confirmado: boolean) => {
    setEstado((prev) => {
      prev.resolver?.(confirmado);
      return { ...prev, visible: false, resolver: undefined };
    });
    if (ultimoFocus.current) ultimoFocus.current.focus();
  }, []);

  const abrir = useCallback((opciones?: OpcionesModal) => {
    ultimoFocus.current = document.activeElement as HTMLElement | null;
    return new Promise<boolean>((resolve) => {
      setEstado((prev) => ({
        ...prev,
        ...opciones,
        visible: true,
        resolver: resolve,
      }));
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      setEstado((s) => {
        if (!s.visible) return s;
        if (e.key === "Escape" && !s.bloquearCierre) {
          s.resolver?.(false);
          return { ...s, visible: false, resolver: undefined };
        }
        return s;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!estado.visible || !estado.autoCerrarMs) return;
    const t = setTimeout(() => cerrarInterno(true), estado.autoCerrarMs);
    return () => clearTimeout(t);
  }, [estado.visible, estado.autoCerrarMs, cerrarInterno]);

  const api = useMemo<Ctx>(() => {
    const base = (tipo: TipoModal, o?: OpcionesModal) =>
      abrir({
        tipo,
        ...o,
        bloquearCierre: o?.bloquearCierre ?? (tipo === "proceso"),
        mostrarCancelar:
          o?.mostrarCancelar ?? !(tipo === "exito" || tipo === "proceso"),
      });

    return {
      abrir,
      cerrar: cerrarInterno,
      confirmar: (o) =>
        base("confirmacion", {
          titulo: "Confirmar acción",
          textoConfirmar: "Confirmar",
          ...o,
        }).then(async (ok) => {
          if (ok) await o?.onConfirmar?.();
          else await o?.onCancelar?.();
          return ok;
        }),
      eliminar: (o) =>
        base("eliminacion", {
          titulo: "Confirmar eliminación",
          textoConfirmar: "Eliminar",
          ...o,
        }).then(async (ok) => {
          if (ok) await o?.onConfirmar?.();
          else await o?.onCancelar?.();
          return ok;
        }),
      exito: (o) =>
        base("exito", {
          titulo: "Operación exitosa",
          autoCerrarMs: o?.autoCerrarMs ?? 1800,
          textoConfirmar: "Aceptar",
          ...o,
        }).then(async (ok) => {
          if (ok) await o?.onConfirmar?.();
          else await o?.onCancelar?.();
          return ok;
        }),
      error: (o) =>
        base("error", {
          titulo: "Ocurrió un error",
          textoConfirmar: "Entendido",
          ...o,
        }).then(async (ok) => {
          if (ok) await o?.onConfirmar?.();
          else await o?.onCancelar?.();
          return ok;
        }),
      advertir: (o) =>
        base("advertencia", {
          titulo: "Advertencia",
          textoConfirmar: "Entendido",
          ...o,
        }).then(async (ok) => {
          if (ok) await o?.onConfirmar?.();
          else await o?.onCancelar?.();
          return ok;
        }),
      proceso: (o) =>
        base("proceso", {
          titulo: "Procesando",
          textoConfirmar: "Procesando...",
          ...o,
        }).then(async (ok) => {
          if (ok) await o?.onConfirmar?.();
          else await o?.onCancelar?.();
          return ok;
        }),
    };
  }, [abrir, cerrarInterno]);

  return (
    <ModalContext.Provider value={api}>
      {children}
      <ModalBase
        estado={estado}
        onFondo={() => {
          if (!estado.bloquearCierre) cerrarInterno(false);
        }}
        onConfirmar={async () => {
          const resolver = estado.resolver;
          setEstado((s) => ({ ...s, visible: false, resolver: undefined }));
          resolver?.(true);
        }}
        onCancelar={async () => {
          const resolver = estado.resolver;
          setEstado((s) => ({ ...s, visible: false, resolver: undefined }));
          resolver?.(false);
        }}
      />
    </ModalContext.Provider>
  );
}

/* =========================
   Hook de consumo
   ========================= */

export function useModalGeneral() {
  const ctx = useContext(ModalContext);
  if (!ctx)
    throw new Error("useModalGeneral debe usarse dentro de <ModalProvider>.");
  return ctx;
}
