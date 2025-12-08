// src/components/certificados/DisenoCertificado.tsx
import React from "react";

export type ModalidadCategoria = "INDIVIDUAL" | "GRUPAL";
export type TipoMedalla = "ORO" | "PLATA" | "BRONCE" | "MENCION";

export interface CertificadoProps {
  nombreGanador: string;
  ci?: string | null;
  unidadEducativa: string;
  medalla: TipoMedalla;
  nota: number;
  area: string;
  nivel: string;
  modalidad: ModalidadCategoria;
  gestion: number;
  nombreResponsable?: string | null;
}

const DisenoCertificado: React.FC<CertificadoProps> = ({
  nombreGanador,
  ci,
  unidadEducativa,
  medalla,
  nota,
  area,
  nivel,
  modalidad,
  gestion,
  nombreResponsable,
}) => {
  const textoModalidad =
    modalidad === "INDIVIDUAL" ? "participante" : "equipo ganador";

  const etiquetaMedalla = (() => {
    switch (medalla) {
      case "ORO":
        return "Medalla de Oro";
      case "PLATA":
        return "Medalla de Plata";
      case "BRONCE":
        return "Medalla de Bronce";
      case "MENCION":
      default:
        return "Mención de Honor";
    }
  })();

  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-amber-300 bg-gradient-to-br from-white via-amber-50 to-white p-8 shadow-xl dark:border-amber-600/60 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
      <div className="flex flex-col items-center gap-4 border-b border-amber-200 pb-4 text-center dark:border-amber-700/50">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700 dark:text-amber-300">
          Gestión {gestion}
        </p>
        <h1 className="text-3xl font-bold tracking-wide text-gray-900 dark:text-white">
          Certificado de Reconocimiento
        </h1>
        <p className="max-w-xl text-xs text-gray-600 dark:text-gray-300">
          La Comisión Organizadora de la Olimpiada Científica, área{" "}
          <span className="font-semibold text-gray-800 dark:text-gray-100">
            {area}
          </span>{" "}
          – nivel{" "}
          <span className="font-semibold text-gray-800 dark:text-gray-100">
            {nivel}
          </span>
          , extiende el presente certificado a:
        </p>
      </div>

      <div className="mt-6 space-y-4 text-center">
        <p className="text-lg font-semibold uppercase tracking-wide text-gray-900 dark:text-white">
          {nombreGanador}
        </p>
        {ci && (
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Documento de identidad: <span className="font-semibold">{ci}</span>
          </p>
        )}
        <p className="text-xs text-gray-700 dark:text-gray-300">
          Unidad educativa:{" "}
          <span className="font-semibold">{unidadEducativa}</span>
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs">
          <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-3 py-1 font-semibold uppercase tracking-wide text-amber-800 dark:border-amber-500/70 dark:bg-amber-900/40 dark:text-amber-200">
            {etiquetaMedalla}
          </span>
          <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 font-medium text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
            Nota final: {nota.toFixed(2)}
          </span>
          <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
            Modalidad {modalidad === "INDIVIDUAL" ? "Individual" : "Grupal"} –{" "}
            {textoModalidad}
          </span>
        </div>

        <p className="mx-auto mt-4 max-w-2xl text-xs leading-relaxed text-gray-700 dark:text-gray-300">
          En reconocimiento a su destacada participación y desempeño académico
          en la Olimpiada Científica, obteniendo el resultado antes señalado,
          demostrando compromiso, dedicación y excelencia.
        </p>
      </div>

      <div className="mt-10 flex flex-col items-center justify-between gap-8 border-t border-dashed border-gray-300 pt-8 text-center text-xs text-gray-700 dark:border-gray-700 dark:text-gray-300 md:flex-row">
        <div className="mx-auto flex flex-col items-center md:mx-0">
          <div className="h-[1px] w-56 bg-gray-400 dark:bg-gray-500" />
          <p className="mt-2 font-semibold text-gray-800 dark:text-gray-100">
            {nombreResponsable || "Responsable de área"}
          </p>
          <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Responsable de la categoría
          </p>
        </div>

        <div className="text-[11px] text-gray-500 dark:text-gray-400">
          Emitido en la gestión {gestion}
          <br />
          Sistema de Gestión de Olimpiadas
        </div>
      </div>
    </div>
  );
};

export default DisenoCertificado;
