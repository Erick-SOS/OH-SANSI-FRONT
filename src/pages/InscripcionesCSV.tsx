// src/pages/ImportarInscritos.tsx
import { useState, type ChangeEvent } from "react";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import InstruccionesImportarCSVModal from "../components/modals/InstruccionesImportarCSV";
import ConfirmModal from "../components/modals/ConfirmModal";
import ResultModal from "../components/modals/ResultModal";
import { API_ROOT } from "../api";

// --- Cabeceras esperadas (idénticas al backend) ---
const HEADERS_ESPERADOS: readonly string[] = [
  "MODALIDAD",
  "AREA_NOMBRE",
  "NIVEL_NOMBRE",
  "OLI_TDOC",
  "OLI_NRODOC",
  "OLI_NOMBRE",
  "OLI_PRIMER_AP",
  "OLI_SEGUNDO_AP",
  "OLI_UNID_EDU",
  "OLI_DEPTO",
  "OLI_GRADO",
  "OLI_F_NAC",
  "OLI_SEXO",
  "OLI_CORREO",
  "TUTOR_TDOC",
  "TUTOR_NRODOC",
  "TUTOR_NOMBRE",
  "TUTOR_PRIMER_AP",
  "TUTOR_SEGUNDO_AP",
  "TUTOR_TEL",
  "TUTOR_CORREO",
  "TUTOR_UNID_EDU",
  "TUTOR_PROF",
  "EQUIPO_NOMBRE",
  "ROL_EQUIPO",
];

// ---- Tipos que devuelve el backend (resumen principal) ----
type ResumenImportacion = {
  totalProcesadas: number;
  insertadasIndividual: number;
  equiposInscritos: number;
  miembrosInsertados: number;
  filasDescartadas: number;
  equiposRechazados: number;
  totalWarnings: number;
};

type FilaMensaje = {
  fila: number | string;
  mensaje: string;
};

type EquipoRechazado = {
  equipo: string;
  motivo: string;
};

type ResultadoImportacion = {
  ok: boolean;
  mensaje_exito?: string;
  mensaje_error?: string;
  resumen: ResumenImportacion;
  advertencias_por_fila: FilaMensaje[];
  errores_por_fila: FilaMensaje[];
  equipos_rechazados: EquipoRechazado[];
};

// Posible cuerpo de error genérico (400, 500, etc.)
type ApiErrorBody = {
  ok?: boolean;
  mensaje?: string;
  mensaje_error?: string;
  detalle?: {
    faltantes?: string[];
    headers_recibidos?: string[];
  };
  [key: string]: unknown;
};

type ImportApiResponse = ResultadoImportacion | ApiErrorBody;

// Helper para extraer un mensaje entendible desde la respuesta
function extraerMensaje(json: ImportApiResponse | null): string {
  if (!json) return "No se recibió una respuesta válida del servidor.";

  if ("mensaje_error" in json && typeof json.mensaje_error === "string") {
    return json.mensaje_error;
  }

  if ("mensaje_exito" in json && typeof json.mensaje_exito === "string") {
    return json.mensaje_exito;
  }

  if ("mensaje" in json && typeof json.mensaje === "string") {
    return json.mensaje;
  }

  return "Se produjo un error al procesar el archivo.";
}

// Detecta si la respuesta tiene el bloque completo de detalle de importación
function tieneDetalleImportacion(
  json: ImportApiResponse | null
): json is ResultadoImportacion {
  if (!json || typeof json !== "object") return false;
  return (
    "resumen" in json &&
    "advertencias_por_fila" in json &&
    "errores_por_fila" in json &&
    "equipos_rechazados" in json
  );
}

const BASE = `${API_ROOT.replace(/\/$/, "")}/api`;
const IMPORT_URL = `${BASE}/inscripciones/csv`;

export default function ImportarInscritosPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [importOk, setImportOk] = useState<string | null>(null);
  const [importErr, setImportErr] = useState<string | null>(null);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [resultModal, setResultModal] = useState<{
    visible: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });
  const [instruccionesVisible, setInstruccionesVisible] = useState(false);

  const [resultado, setResultado] = useState<ResultadoImportacion | null>(null);

  // Detalle específico cuando hay problema de encabezados
  const [headersDetalle, setHeadersDetalle] = useState<{
    faltantes?: string[];
    headers_recibidos?: string[];
  } | null>(null);

  const showResultModal = (
    type: "success" | "error",
    title: string,
    message: string
  ) => {
    setResultModal({ visible: true, type, title, message });
  };

  const closeResultModal = () =>
    setResultModal((prev) => ({ ...prev, visible: false }));

  // ---- Selección de archivo ----
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setImportOk(null);
    setImportErr(null);
    setResultado(null);
    setHeadersDetalle(null);

    if (!selected) {
      setFile(null);
      setFileError(null);
      return;
    }

    const name = selected.name.toLowerCase();
    const isValid =
      name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".csv");

    if (!isValid) {
      setFile(null);
      setFileError("Solo se permiten archivos .xlsx, .xls o .csv.");
      return;
    }

    setFile(selected);
    setFileError(null);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileError(null);
    setImportOk(null);
    setImportErr(null);
    setResultado(null);
    setHeadersDetalle(null);

    const input = document.getElementById(
      "archivo-inscritos"
    ) as HTMLInputElement | null;
    if (input) input.value = "";
  };

  // ---- Enviar archivo al servidor (FormData) ----
  const procesarArchivo = async () => {
    if (!file) return;

    setProcessing(true);
    setImportOk("Procesando archivo, por favor espere…");
    setImportErr(null);
    setHeadersDetalle(null);

    try {
      const formData = new FormData();
      formData.append("archivo", file);

      const res = await fetch(IMPORT_URL, {
        method: "POST",
        body: formData,
      });

      const json = (await res
        .json()
        .catch(() => null)) as ImportApiResponse | null;

      // Si viene detalle completo de importación, lo mostramos SIEMPRE
      if (tieneDetalleImportacion(json)) {
        setResultado(json);
      } else {
        setResultado(null);
      }

      if (!res.ok) {
        const msg = extraerMensaje(json);
        setImportErr(msg);
        setImportOk(null);

        // Detalle de encabezados (cuando falten columnas o estén mal nombradas)
        if (json && "detalle" in json) {
          const detalle = (json as ApiErrorBody).detalle;
          if (detalle && typeof detalle === "object") {
            const faltantes =
              "faltantes" in detalle && Array.isArray(detalle.faltantes)
                ? detalle.faltantes.map((v) => String(v))
                : undefined;
            const headersRecibidos =
              "headers_recibidos" in detalle &&
              Array.isArray(detalle.headers_recibidos)
                ? detalle.headers_recibidos.map((v) => String(v))
                : undefined;

            setHeadersDetalle(
              faltantes || headersRecibidos
                ? {
                    faltantes,
                    headers_recibidos: headersRecibidos,
                  }
                : null
            );
          }
        }

        showResultModal("error", "Error al importar el archivo", msg);
        return;
      }

      // 2xx con detalle
      if (tieneDetalleImportacion(json)) {
        const data = json;
        if (data.ok) {
          const msg =
            data.mensaje_exito ||
            "La importación se completó correctamente. Revise el resumen de resultados.";
          setImportOk(msg);
          setImportErr(null);
          showResultModal("success", "Importación completada", msg);
        } else {
          const msg =
            data.mensaje_error ||
            "El archivo se procesó, pero no se pudieron registrar inscripciones.";
          setImportErr(msg);
          setImportOk(null);
          showResultModal("error", "Importación con incidencias", msg);
        }
      } else {
        // 2xx pero sin detalle (caso excepcional)
        const msg = extraerMensaje(json);
        setImportOk(msg);
        setImportErr(null);
        showResultModal("success", "Importación finalizada", msg);
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo establecer comunicación con el servidor.";
      setImportErr(msg);
      setImportOk(null);
      setResultado(null);
      showResultModal("error", "Error de comunicación", msg);
    } finally {
      setProcessing(false);
      setConfirmVisible(false);
    }
  };

  const abrirConfirm = () => {
    if (!file) {
      setFileError("Primero selecciona un archivo válido.");
      return;
    }
    setConfirmVisible(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 transition-colors dark:bg-gray-950 sm:p-6">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <header className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              Importar inscritos (Excel / CSV)
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Cargue el archivo de inscritos y ejecute la importación. El
              sistema validará encabezados y registros antes de registrarlos.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
            <div className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700 shadow-sm dark:border-blue-900/60 dark:bg-blue-900/20 dark:text-blue-200">
              <FileSpreadsheet className="h-4 w-4" />
              <span>Formatos admitidos: XLSX, XLS, CSV</span>
            </div>

            <button
              type="button"
              onClick={() => setInstruccionesVisible(true)}
              className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
            >
              Ver instrucciones / plantilla
            </button>
          </div>
        </header>

        {/* Card principal */}
        <main className="space-y-5">
          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)] lg:items-start">
              {/* Área grande de subida */}
              <div>
                <p className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  1. Cargar archivo de inscritos
                </p>
                <p className="mb-3 text-xs text-gray-600 dark:text-gray-400">
                  Utilice la plantilla oficial y asegúrese de que los
                  encabezados sean idénticos (incluyendo mayúsculas) a los
                  requeridos.
                </p>

                <input
                  id="archivo-inscritos"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <label
                  htmlFor="archivo-inscritos"
                  className="group relative flex h-52 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 text-center text-sm font-medium text-gray-700 shadow-sm transition hover:border-brand-500 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-100 dark:hover:bg-gray-900"
                >
                  <div className="flex flex-col items-center justify-center px-4">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200 group-hover:ring-brand-500 dark:bg-gray-800 dark:ring-gray-700">
                      <Upload className="h-6 w-6 text-gray-500 group-hover:text-brand-500 dark:text-gray-300" />
                    </div>
                    <span className="text-sm font-semibold">
                      Haga clic aquí para seleccionar un archivo
                    </span>
                    <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      También puede arrastrar y soltar el archivo sobre esta
                      área.
                    </span>
                    <span className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                      Extensiones permitidas: <strong>XLSX, XLS, CSV</strong>
                    </span>
                  </div>
                </label>

                {/* Archivo seleccionado */}
                {file && (
                  <div className="mt-3 flex flex-col gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-gray-500 dark:text-gray-300" />
                      <div className="flex flex-col">
                        <span className="truncate text-gray-900 dark:text-gray-100">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="mt-1 inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 shadow-sm transition hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:bg-gray-900 dark:text-red-300 dark:hover:bg-red-950 sm:mt-0"
                    >
                      Quitar archivo
                    </button>
                  </div>
                )}

                {/* Error de archivo */}
                {fileError && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200">
                    <AlertTriangle className="mt-0.5 h-4 w-4" />
                    <p>{fileError}</p>
                  </div>
                )}

                {/* Detalle de encabezados cuando el servidor lo indica */}
                {headersDetalle && (
                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
                    <p className="mb-1 flex items-center gap-1.5 font-semibold">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Detalle de encabezados del archivo
                    </p>
                    {headersDetalle.faltantes &&
                      headersDetalle.faltantes.length > 0 && (
                        <p className="mt-1">
                          <span className="font-semibold">
                            Columnas faltantes:
                          </span>{" "}
                          {headersDetalle.faltantes.join(", ")}
                        </p>
                      )}
                    {headersDetalle.headers_recibidos &&
                      headersDetalle.headers_recibidos.length > 0 && (
                        <p className="mt-1">
                          <span className="font-semibold">
                            Encabezados detectados:
                          </span>{" "}
                          {headersDetalle.headers_recibidos.join(", ")}
                        </p>
                      )}
                  </div>
                )}
              </div>

              {/* Panel derecho: cabeceras requeridas + procesar */}
              <div className="space-y-4">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs dark:border-gray-700 dark:bg-gray-800/80">
                  <p className="mb-1 font-semibold text-gray-900 dark:text-gray-100">
                    Encabezados requeridos en el archivo
                  </p>
                  <p className="mb-2 text-[11px] text-gray-600 dark:text-gray-400">
                    El archivo debe incluir, como mínimo, las siguientes
                    columnas en la primera fila:
                  </p>
                  <div className="max-h-40 space-y-1 overflow-auto pr-1">
                    <ul className="flex flex-wrap gap-1">
                      {HEADERS_ESPERADOS.map((h) => (
                        <li
                          key={h}
                          className="rounded-full bg-white px-2 py-0.5 text-[11px] font-mono text-gray-800 shadow-sm dark:bg-gray-900 dark:text-gray-200"
                        >
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs dark:border-gray-700 dark:bg-gray-800/80">
                  <p className="mb-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    2. Ejecutar importación
                  </p>
                  <p className="mb-3 text-[11px] text-gray-600 dark:text-gray-400">
                    Se validarán los encabezados y cada fila del archivo. Los
                    registros válidos se integrarán al sistema y se mostrará un
                    resumen con advertencias y errores agrupados.
                  </p>

                  <button
                    type="button"
                    onClick={abrirConfirm}
                    disabled={!file || processing}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-brand-500 dark:hover:bg-brand-400 dark:focus-visible:ring-offset-gray-950"
                  >
                    {processing ? "Procesando…" : "Procesar archivo"}
                  </button>

                  {/* Mensajes cortos de estado */}
                  {importOk && !importOk.includes("Procesando") && (
                    <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-2 text-xs text-green-800 dark:border-green-900 dark:bg-green-900/20 dark:text-green-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{importOk}</span>
                      </div>
                    </div>
                  )}

                  {importErr && !importErr.includes("Procesando") && (
                    <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-800 dark:border-red-900 dark:bg-red-900/20 dark:text-red-200">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        <span>{importErr}</span>
                      </div>
                    </div>
                  )}

                  {processing && (
                    <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                      El archivo se está analizando. Esta operación puede tomar
                      algunos segundos, dependiendo del tamaño del archivo.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Resumen detallado: se muestra tanto en éxito como en error si vino desde el backend */}
          {resultado && (
            <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {resultado.ok
                  ? "Resumen de la última importación"
                  : "Resumen del procesamiento (sin inserciones)"}
              </h2>

              {/* Stats */}
              <div className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/70">
                  <p className="text-gray-500 dark:text-gray-400">
                    Filas procesadas
                  </p>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                    {resultado.resumen.totalProcesadas}
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/60 dark:bg-emerald-900/20">
                  <p className="text-emerald-700 dark:text-emerald-200">
                    Inscripciones individuales
                  </p>
                  <p className="mt-1 text-lg font-semibold text-emerald-800 dark:text-emerald-100">
                    {resultado.resumen.insertadasIndividual}
                  </p>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-900/60 dark:bg-blue-900/20">
                  <p className="text-blue-700 dark:text-blue-200">
                    Equipos inscritos / miembros
                  </p>
                  <p className="mt-1 text-lg font-semibold text-blue-800 dark:text-blue-100">
                    {resultado.resumen.equiposInscritos} equipos ·{" "}
                    {resultado.resumen.miembrosInsertados} miembros
                  </p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/60 dark:bg-amber-900/20">
                  <p className="text-amber-700 dark:text-amber-200">
                    Advertencias totales
                  </p>
                  <p className="mt-1 text-lg font-semibold text-amber-800 dark:text-amber-100">
                    {resultado.resumen.totalWarnings}
                  </p>
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/60 dark:bg-red-900/20">
                  <p className="text-red-700 dark:text-red-200">
                    Filas descartadas
                  </p>
                  <p className="mt-1 text-lg font-semibold text-red-800 dark:text-red-100">
                    {resultado.resumen.filasDescartadas}
                  </p>
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/60 dark:bg-red-900/20">
                  <p className="text-red-700 dark:text-red-200">
                    Equipos rechazados
                  </p>
                  <p className="mt-1 text-lg font-semibold text-red-800 dark:text-red-100">
                    {resultado.resumen.equiposRechazados}
                  </p>
                </div>
              </div>

              {/* Advertencias */}
              {resultado.advertencias_por_fila.length > 0 && (
                <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs dark:border-amber-900/60 dark:bg-amber-900/10">
                  <p className="mb-1 flex items-center gap-1.5 font-medium text-amber-800 dark:text-amber-200">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Advertencias por fila
                  </p>
                  <div className="mt-1 max-h-40 space-y-1 overflow-auto pr-1">
                    {resultado.advertencias_por_fila.map((w, idx) => (
                      <div
                        key={`${w.fila}-${idx}`}
                        className="rounded-md bg-amber-100/80 px-2 py-1 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100"
                      >
                        <span className="font-semibold">Fila {w.fila}:</span>{" "}
                        {w.mensaje}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Errores */}
              {resultado.errores_por_fila.length > 0 && (
                <div className="mt-2 rounded-xl border border-red-200 bg-red-50/70 p-3 text-xs dark:border-red-900/60 dark:bg-red-900/10">
                  <p className="mb-1 flex items-center gap-1.5 font-medium text-red-800 dark:text-red-200">
                    <XCircle className="h-3.5 w-3.5" />
                    Errores agrupados por filas
                  </p>
                  <div className="mt-1 max-h-40 space-y-1 overflow-auto pr-1">
                    {resultado.errores_por_fila.map((e, idx) => (
                      <div
                        key={`${e.fila}-${idx}`}
                        className="rounded-md bg-red-100/90 px-2 py-1 text-red-900 dark:bg-red-900/40 dark:text-red-100"
                      >
                        <span className="font-semibold">Fila(s) {e.fila}:</span>{" "}
                        {e.mensaje}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Equipos rechazados */}
              {resultado.equipos_rechazados.length > 0 && (
                <div className="mt-2 rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs dark:border-red-900/60 dark:bg-red-900/10">
                  <p className="mb-1 text-sm font-semibold text-red-800 dark:text-red-200">
                    Equipos rechazados
                  </p>
                  <ul className="ml-4 list-disc space-y-1 text-red-800 dark:text-red-200">
                    {resultado.equipos_rechazados.map((eq, idx) => (
                      <li key={`${eq.equipo}-${idx}`}>
                        <span className="font-semibold">{eq.equipo}:</span>{" "}
                        {eq.motivo}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}
        </main>
      </div>

      {/* Confirmar procesamiento */}
      <ConfirmModal
        visible={confirmVisible}
        title="Procesar archivo de inscritos"
        message={
          file
            ? `Se analizará el archivo "${file.name}" y se aplicarán las validaciones definidas. Revise el resumen de resultados al finalizar.`
            : "Selecciona primero un archivo válido."
        }
        onCancel={() => {
          if (!processing) setConfirmVisible(false);
        }}
        onConfirm={procesarArchivo}
        confirmText="Sí, procesar archivo"
        cancelText="Cancelar"
        danger={false}
        loading={processing}
      />

      {/* Resultado final (éxito / error) */}
      <ResultModal
        visible={resultModal.visible}
        type={resultModal.type}
        title={resultModal.title}
        message={resultModal.message}
        onClose={closeResultModal}
      />
      <InstruccionesImportarCSVModal
        visible={instruccionesVisible}
        onClose={() => setInstruccionesVisible(false)}
      />
    </div>
  );
}
