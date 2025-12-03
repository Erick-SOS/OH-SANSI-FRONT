// src/pages/Niveles.tsx
import { useEffect, useMemo, useState } from "react";
import { Edit3, Trash2, Plus } from "lucide-react";
import TablaBase from "../components/tables/TablaBase";
import Paginacion from "../components/ui/Paginacion";
import BarraBusquedaAreas from "../components/tables/BarraBusqueda";
import ConfirmModal from "../components/modals/ConfirmModal";
import ResultModal from "../components/modals/ResultModal";
import { api } from "../api";

/* ------------ Tipos ------------ */

export interface NivelDto {
  id: number;
  nombre: string;
  codigo: string | null;
  descripcion: string | null;
  estado: boolean;
}

type NivelFormValues = {
  nombre: string;
  codigo: string;
  descripcion: string;
};

/* ------------ Modal de formulario (crear / editar) ------------ */

type NivelFormModalProps = {
  visible: boolean;
  mode: "create" | "edit";
  initialData?: NivelDto | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: NivelFormValues) => Promise<void>;
};

function NivelFormModal({
  visible,
  mode,
  initialData,
  loading = false,
  onClose,
  onSubmit,
}: NivelFormModalProps) {
  const [form, setForm] = useState<NivelFormValues>({
    nombre: "",
    codigo: "",
    descripcion: "",
  });

  const [errors, setErrors] = useState<{
    nombre?: string;
    codigo?: string;
    descripcion?: string;
  }>({});

  // Cargar datos al abrir modal
  useEffect(() => {
    if (visible) {
      setForm({
        nombre: initialData?.nombre ?? "",
        codigo: initialData?.codigo ?? "",
        descripcion: initialData?.descripcion ?? "",
      });
      setErrors({});
    }
  }, [visible, initialData]);

  if (!visible) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const next: typeof errors = {};

    if (!form.nombre.trim()) {
      next.nombre = 'El campo "Nombre" es obligatorio.';
    } else if (form.nombre.trim().length > 100) {
      next.nombre = "Máximo 100 caracteres.";
    }

    if (form.codigo && form.codigo.length > 50) {
      next.codigo = "Máximo 50 caracteres.";
    }

    if (form.descripcion && form.descripcion.length > 255) {
      next.descripcion = "Máximo 255 caracteres.";
    }

    setErrors(next);
    return Object.values(next).every((v) => !v);
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    await onSubmit({
      nombre: form.nombre.trim(),
      codigo: form.codigo.trim(),
      descripcion: form.descripcion.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
    >
      <div className="w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-5 shadow-xl ring-1 ring-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:ring-gray-800 sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
          {mode === "create" ? "Agregar nivel" : "Editar nivel"}
        </h2>

        <div className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Nombre del nivel <span className="text-red-500">*</span>
            </label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              maxLength={100}
              className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition
                bg-white text-gray-900 placeholder:text-gray-400
                dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500
                ${
                  errors.nombre
                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-400"
                    : "border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-400 dark:border-gray-700"
                }`}
              placeholder="Ej: Primaria"
            />
            {errors.nombre && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.nombre}
              </p>
            )}
          </div>

          {/* Código */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Código <span className="text-red-500">*</span>
            </label>
            <input
              name="codigo"
              value={form.codigo}
              onChange={handleChange}
              maxLength={50}
              className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition
                bg-white text-gray-900 placeholder:text-gray-400
                dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500
                ${
                  errors.codigo
                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-400"
                    : "border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-400 dark:border-gray-700"
                }`}
              placeholder="Ej: NIV-P"
            />
            {errors.codigo && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.codigo}
              </p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows={3}
              maxLength={255}
              className={`w-full resize-none rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition
                bg-white text-gray-900 placeholder:text-gray-400
                dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500
                ${
                  errors.descripcion
                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-400"
                    : "border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-400 dark:border-gray-700"
                }`}
              placeholder="Descripción breve del nivel"
            />
            {errors.descripcion && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.descripcion}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus-visible:ring-offset-gray-900 sm:w-auto"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70 dark:bg-brand-500 dark:hover:bg-brand-400 dark:focus-visible:ring-offset-gray-900 sm:w-auto"
          >
            {loading
              ? mode === "create"
                ? "Guardando..."
                : "Actualizando..."
              : mode === "create"
              ? "Guardar Nivel"
              : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------ Página principal ------------ */

const REGISTROS_PAGINA = 7;

export default function NivelesPage() {
  const [niveles, setNiveles] = useState<NivelDto[]>([]);
  const [loadingListado, setLoadingListado] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [, setOrdenColumna] = useState<string | null>(null);
  const [, setOrdenDireccion] = useState<"asc" | "desc">("asc");

  // Modal form (crear / editar)
  const [formVisible, setFormVisible] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [nivelSeleccionado, setNivelSeleccionado] = useState<NivelDto | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  // Modal confirmar eliminar
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [nivelAEliminar, setNivelAEliminar] = useState<NivelDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Modal de resultado (success / error)
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

  const showResult = (
    type: "success" | "error",
    title: string,
    message: string
  ) => {
    setResultModal({ visible: true, type, title, message });
  };

  const closeResult = () =>
    setResultModal((prev) => ({ ...prev, visible: false }));

  /* ---- Cargar niveles desde el backend ---- */

  const cargarNiveles = async () => {
    setLoadingListado(true);
    try {
      const data = (await api("/niveles")) as NivelDto[];
      setNiveles(data);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los niveles.";
      showResult("error", "Error al cargar", msg);
    } finally {
      setLoadingListado(false);
    }
  };

  useEffect(() => {
    void cargarNiveles();
  }, []);

  /* ---- Ordenamiento ---- */

  const handleOrdenar = (columna: string, direccion: "asc" | "desc") => {
    setOrdenColumna(columna);
    setOrdenDireccion(direccion);
    setNiveles((prev) => {
      const copia = [...prev];
      copia.sort((a, b) => {
        const valA = (a as any)[columna];
        const valB = (b as any)[columna];

        if (typeof valA === "string" && typeof valB === "string") {
          return direccion === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }
        return 0;
      });
      return copia;
    });
  };

  /* ---- Búsqueda y paginación ---- */

  const nivelesFiltrados = useMemo(() => {
    if (!busqueda.trim()) return niveles;
    const term = busqueda.toLowerCase();
    return niveles.filter((n) => {
      const nombre = n.nombre?.toLowerCase() ?? "";
      const codigo = n.codigo?.toLowerCase() ?? "";
      const descripcion = n.descripcion?.toLowerCase() ?? "";
      return (
        nombre.includes(term) || codigo.includes(term) || descripcion.includes(term)
      );
    });
  }, [niveles, busqueda]);

  const nivelesPaginados = useMemo(() => {
    const inicio = (pagina - 1) * REGISTROS_PAGINA;
    return nivelesFiltrados.slice(inicio, inicio + REGISTROS_PAGINA);
  }, [nivelesFiltrados, pagina]);

  /* ---- Handlers de UI ---- */

  const abrirCrear = () => {
    setFormMode("create");
    setNivelSeleccionado(null);
    setFormVisible(true);
  };

  const abrirEditar = (nivel: NivelDto) => {
    setFormMode("edit");
    setNivelSeleccionado(nivel);
    setFormVisible(true);
  };

  const handleSubmitNivel = async (values: NivelFormValues) => {
    setSaving(true);
    try {
      if (formMode === "create") {
        const creado = (await api("/niveles", {
          method: "POST",
          body: values,
        })) as NivelDto;
        setNiveles((prev) => [...prev, creado]);
        showResult(
          "success",
          "Nivel creado",
          `El nivel "${creado.nombre}" se creó correctamente.`
        );
      } else if (formMode === "edit" && nivelSeleccionado) {
        const actualizado = (await api(`/niveles/${nivelSeleccionado.id}`, {
          method: "PUT",
          body: values,
        })) as NivelDto;
        setNiveles((prev) =>
          prev.map((n) => (n.id === actualizado.id ? actualizado : n))
        );
        showResult(
          "success",
          "Nivel actualizado",
          `El nivel "${actualizado.nombre}" se actualizó correctamente.`
        );
      }
      setFormVisible(false);
      setNivelSeleccionado(null);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "No se pudo guardar el nivel.";
      showResult("error", "Error al guardar", msg);
    } finally {
      setSaving(false);
    }
  };

  const solicitarEliminar = (nivel: NivelDto) => {
    setNivelAEliminar(nivel);
    setConfirmVisible(true);
  };

  const confirmarEliminar = async () => {
    if (!nivelAEliminar) return;

    setDeleting(true);
    try {
      const resp = (await api(`/niveles/${nivelAEliminar.id}`, {
        method: "DELETE",
      })) as { mensaje?: string };
      setNiveles((prev) =>
        prev.filter((n) => n.id !== nivelAEliminar.id)
      );
      showResult(
        "success",
        "Nivel eliminado",
        resp.mensaje || `El nivel "${nivelAEliminar.nombre}" se eliminó correctamente.`
      );
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "No se pudo eliminar el nivel.";
      showResult("error", "Error al eliminar", msg);
    } finally {
      setDeleting(false);
      setConfirmVisible(false);
      setNivelAEliminar(null);
    }
  };

  const columnas = [
    {
      clave: "nombre" as const,
      titulo: "Nombre",
      alineacion: "izquierda" as const,
      ordenable: true,
    },
    {
      clave: "codigo" as const,
      titulo: "Código",
      alineacion: "centro" as const,
      ordenable: true,
    },
    {
      clave: "descripcion" as const,
      titulo: "Descripción",
      alineacion: "izquierda" as const,
      ordenable: false,
    },
  ];

  const renderAcciones = (fila: NivelDto) => (
    <div className="flex justify-center gap-2">
      <button
        type="button"
        onClick={() => abrirEditar(fila)}
        className="inline-flex items-center justify-center rounded-full border border-transparent bg-blue-50 p-1.5 text-blue-600 shadow-sm transition hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
        aria-label="Editar nivel"
      >
        <Edit3 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => solicitarEliminar(fila)}
        className="inline-flex items-center justify-center rounded-full border border-transparent bg-red-50 p-1.5 text-red-600 shadow-sm transition hover:bg-red-100 hover:text-red-700 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
        aria-label="Eliminar nivel"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 transition-colors dark:bg-gray-950 sm:p-6">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="mb-5 flex flex-col gap-3 sm:mb-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              Niveles de competencia
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Gestiona los niveles utilizados en las áreas de la Olimpiada.
            </p>
          </div>

          <button
            type="button"
            onClick={abrirCrear}
            className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-brand-500 dark:hover:bg-brand-400 dark:focus-visible:ring-offset-gray-950"
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar nivel
          </button>
        </div>

        {/* Card filtros + tabla */}
        <div className="space-y-4">
          {/* Filtros */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="w-full max-w-md">
                <BarraBusquedaAreas
                  terminoBusqueda={busqueda}
                  onBuscarChange={(t: string) => {
                    setBusqueda(t);
                    setPagina(1);
                  }}
                />
              </div>
              {loadingListado && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Cargando niveles...
                </p>
              )}
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <TablaBase
              datos={nivelesPaginados}
              columnas={columnas}
              conOrdenamiento
              onOrdenar={handleOrdenar}
              conAcciones
              renderAcciones={renderAcciones}
            />
          </div>

          {/* Paginación */}
          <div className="flex justify-end">
            <Paginacion
              paginaActual={pagina}
              totalPaginas={Math.max(
                1,
                Math.ceil(nivelesFiltrados.length / REGISTROS_PAGINA)
              )}
              totalRegistros={nivelesFiltrados.length}
              registrosPorPagina={REGISTROS_PAGINA}
              onPaginaChange={setPagina}
            />
          </div>
        </div>
      </div>

      {/* Modal crear / editar */}
      <NivelFormModal
        visible={formVisible}
        mode={formMode}
        initialData={nivelSeleccionado}
        loading={saving}
        onClose={() => {
          if (!saving) {
            setFormVisible(false);
            setNivelSeleccionado(null);
          }
        }}
        onSubmit={handleSubmitNivel}
      />

      {/* Modal confirmar eliminar */}
      <ConfirmModal
        visible={confirmVisible}
        title="Eliminar nivel"
        message={
          nivelAEliminar
            ? `¿Estás seguro de que quieres eliminar el nivel "${nivelAEliminar.nombre}"? Esta acción no se puede deshacer.`
            : "¿Estás seguro de eliminar este nivel?"
        }
        onCancel={() => {
          if (!deleting) {
            setConfirmVisible(false);
            setNivelAEliminar(null);
          }
        }}
        onConfirm={confirmarEliminar}
        confirmText="Eliminar"
        cancelText="Cancelar"
        danger
        loading={deleting}
      />

      {/* Modal de resultado (éxito / error) */}
      <ResultModal
        visible={resultModal.visible}
        type={resultModal.type}
        title={resultModal.title}
        message={resultModal.message}
        onClose={closeResult}
      />
    </div>
  );
}
