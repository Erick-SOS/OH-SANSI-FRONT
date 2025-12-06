// src/components/modals/InstruccionesImportarCSV.tsx
import { X, Info, Download, ListChecks } from "lucide-react";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const CAMPOS = [
  {
    nombre: "MODALIDAD",
    descripcion:
      "INDIVIDUAL o GRUPAL. Define si la participación es individual o por equipo.",
  },
  {
    nombre: "AREA_NOMBRE",
    descripcion:
      "Nombre del área de la olimpiada (exactamente como está configurada en el sistema).",
  },
  {
    nombre: "NIVEL_NOMBRE",
    descripcion:
      "Nombre del nivel (Primaria, Secundaria, etc.) exactamente como en el sistema.",
  },
  {
    nombre: "OLI_TDOC",
    descripcion:
      "Tipo de documento del olimpista: CI, PASAPORTE o CARNET_EXTRANJERO.",
  },
  {
    nombre: "OLI_NRODOC",
    descripcion:
      "Número de documento del olimpista (sin puntos ni guiones si es posible).",
  },
  {
    nombre: "OLI_NOMBRE",
    descripcion: "Nombres del olimpista.",
  },
  {
    nombre: "OLI_PRIMER_AP",
    descripcion: "Primer apellido del olimpista (obligatorio).",
  },
  {
    nombre: "OLI_SEGUNDO_AP",
    descripcion: "Segundo apellido del olimpista (puede estar vacío).",
  },
  {
    nombre: "OLI_UNID_EDU",
    descripcion: "Nombre de la unidad educativa del olimpista.",
  },
  {
    nombre: "OLI_DEPTO",
    descripcion:
      "Departamento (COCHABAMBA, LA PAZ, SANTA CRUZ, ORURO, POTOSÍ, CHUQUISACA, TARIJA, BENI o PANDO).",
  },
  {
    nombre: "OLI_GRADO",
    descripcion:
      "Curso del estudiante, por ejemplo: 1RO SEC, 2DO SEC, …, 6TO SEC.",
  },
  {
    nombre: "OLI_F_NAC",
    descripcion: "Fecha de nacimiento del olimpista en formato YYYY-MM-DD.",
  },
  {
    nombre: "OLI_SEXO",
    descripcion: "MASCULINO, FEMENINO u OTRO.",
  },
  {
    nombre: "OLI_CORREO",
    descripcion:
      "Correo electrónico del olimpista. Debe ser un email válido y no estar usado por otro olimpista.",
  },
  {
    nombre: "TUTOR_TDOC",
    descripcion:
      "Tipo de documento del tutor: CI, PASAPORTE o CARNET_EXTRANJERO.",
  },
  {
    nombre: "TUTOR_NRODOC",
    descripcion: "Número de documento del tutor.",
  },
  {
    nombre: "TUTOR_NOMBRE",
    descripcion: "Nombres del tutor.",
  },
  {
    nombre: "TUTOR_PRIMER_AP",
    descripcion: "Primer apellido del tutor.",
  },
  {
    nombre: "TUTOR_SEGUNDO_AP",
    descripcion: "Segundo apellido del tutor (opcional).",
  },
  {
    nombre: "TUTOR_TEL",
    descripcion:
      "Teléfono del tutor (solo dígitos, mínimo 7). El sistema valida este campo.",
  },
  {
    nombre: "TUTOR_CORREO",
    descripcion: "Correo electrónico del tutor (formato válido).",
  },
  {
    nombre: "TUTOR_UNID_EDU",
    descripcion:
      "Unidad educativa del tutor (si está vacío se usará la del olimpista).",
  },
  {
    nombre: "TUTOR_PROF",
    descripcion: "Profesión del tutor (puede estar vacío).",
  },
  {
    nombre: "EQUIPO_NOMBRE",
    descripcion:
      "Nombre del equipo (solo para MODALIDAD = GRUPAL; debe estar vacío para INDIVIDUAL).",
  },
  {
    nombre: "ROL_EQUIPO",
    descripcion:
      "Rol dentro del equipo (LIDER o PARTICIPANTE) solo para MODALIDAD = GRUPAL; vacío para INDIVIDUAL.",
  },
];

// Encabezados que usará el backend = nombres de los campos, en el mismo orden
const HEADERS = CAMPOS.map((c) => c.nombre);

export default function InstruccionesImportarCSVModal({ visible, onClose }: Props) {
  if (!visible) return null;

  const handleDescargarPlantilla = () => {
    // Generar un CSV solo con la fila de encabezados
    const headerLine = HEADERS.join(",");
    const contenido = headerLine + "\r\n";

    const blob = new Blob([contenido], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "plantilla_importar_inscritos.csv"; // Excel la abre sin problema

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-black/40 px-3 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
    >
      <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl ring-1 ring-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:ring-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-5 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-brand-500" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
              Instrucciones para importar inscritos
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body scrollable */}
        <div className="max-h-[78vh] space-y-4 overflow-y-auto px-4 py-4 text-sm text-gray-700 dark:text-gray-200 sm:px-5">
          {/* Descarga plantilla */}
          <section className="rounded-xl border border-blue-100 bg-blue-50/70 p-3 dark:border-blue-900/60 dark:bg-blue-900/10">
            <div className="mb-2 flex items-center gap-2">
              <Download className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 sm:text-sm">
                1. Descarga la plantilla base
              </p>
            </div>
            <p className="text-[11px] text-blue-900/80 dark:text-blue-100 sm:text-xs">
              Se generará una plantilla con los encabezados exactos que espera el
              sistema. Completa los datos siguiendo las indicaciones de abajo.
            </p>
            <button
              type="button"
              onClick={handleDescargarPlantilla}
              className="mt-2 inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Descargar plantilla (CSV)
            </button>
          </section>

          {/* Instrucciones de llenado */}
          <section className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/70">
            <div className="mb-2 flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-gray-700 dark:text-gray-200" />
              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 sm:text-sm">
                2. Cómo llenar la plantilla
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {/* INDIVIDUAL */}
              <div className="rounded-lg bg-white p-3 text-xs shadow-sm dark:bg-gray-900/70">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                  MODALIDAD = INDIVIDUAL
                </p>
                <ul className="ml-4 list-disc space-y-1 text-[11px]">
                  <li>
                    En la columna <strong>MODALIDAD</strong> escribe{" "}
                    <strong>INDIVIDUAL</strong>.
                  </li>
                  <li>
                    Llena correctamente <strong>AREA_NOMBRE</strong> y{" "}
                    <strong>NIVEL_NOMBRE</strong> tal como figuran en el sistema.
                  </li>
                  <li>
                    Completa todos los datos del olimpista (<strong>OLI_*</strong>) y del
                    tutor (<strong>TUTOR_*</strong>). Los correos y teléfonos deben ser
                    válidos.
                  </li>
                  <li>
                    Las columnas <strong>EQUIPO_NOMBRE</strong> y{" "}
                    <strong>ROL_EQUIPO</strong>{" "}
                    <span className="font-semibold">DEBEN ir vacías</span>. Si colocas
                    algo ahí, la fila se marcará como error.
                  </li>
                  <li>
                    Cada fila representa <strong>una participación individual</strong> del
                    olimpista en una categoría (área + nivel + modalidad).
                  </li>
                </ul>
              </div>

              {/* GRUPAL */}
              <div className="rounded-lg bg-white p-3 text-xs shadow-sm dark:bg-gray-900/70">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
                  MODALIDAD = GRUPAL
                </p>
                <ul className="ml-4 list-disc space-y-1 text-[11px]">
                  <li>
                    En la columna <strong>MODALIDAD</strong> escribe{" "}
                    <strong>GRUPAL</strong>.
                  </li>
                  <li>
                    Todas las filas del mismo equipo deben tener el mismo{" "}
                    <strong>EQUIPO_NOMBRE</strong>, <strong>AREA_NOMBRE</strong>,{" "}
                    <strong>NIVEL_NOMBRE</strong> y modalidad; si no, el equipo será
                    rechazado.
                  </li>
                  <li>
                    Llena los datos del olimpista (OLI_*) y del tutor (TUTOR_*) en cada
                    fila, igual que en individual.
                  </li>
                  <li>
                    En <strong>EQUIPO_NOMBRE</strong> coloca el nombre del equipo (igual
                    para todos los miembros).
                  </li>
                  <li>
                    En <strong>ROL_EQUIPO</strong> usa solo <strong>LIDER</strong> o{" "}
                    <strong>PARTICIPANTE</strong>. Al menos un miembro debe ser LIDER (si
                    no, el sistema puede promover automáticamente uno).
                  </li>
                  <li>
                    Debe haber <strong>mínimo 3 miembros válidos</strong> por equipo; si
                    no, el equipo se considera rechazado.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Descripción de encabezados */}
          <section className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs dark:border-gray-700 dark:bg-gray-800/70">
            <p className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
              3. Descripción de cada encabezado
            </p>
            <p className="mb-2 text-[11px] text-gray-600 dark:text-gray-400">
              Estos son los encabezados que debe contener la primera fila y qué debes
              escribir en cada uno:
            </p>

            <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
              {CAMPOS.map((c) => (
                <div
                  key={c.nombre}
                  className="rounded-lg bg-white px-2 py-1 shadow-sm dark:bg-gray-900/80"
                >
                  <p className="font-mono text-[11px] font-semibold text-gray-900 dark:text-gray-100">
                    {c.nombre}
                  </p>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300">
                    {c.descripcion}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50 px-4 py-3 text-xs dark:border-gray-800 dark:bg-gray-900/80 sm:px-5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
