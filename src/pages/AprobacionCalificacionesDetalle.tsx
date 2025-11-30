// src/pages/AprobacionCalificaciones.tsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import BarraBusquedaAreas from "../components/tables/BarraBusqueda";
import TablaBase from "../components/tables/TablaBase";
import Paginacion from "../components/ui/Paginacion";

const API_URL =
  import.meta.env.VITE_API_URL || "https://back-oh-sansi.vercel.app";

interface CalificacionItem {
  id: number;
  iniciales: string;
  nombre: string;
  codigo: string;
  estado: "Clasificado" | "No clasificado" | "Descalificado";
  nota: number;
  observacion: string;
}

interface HeaderDetalle {
  area: string;
  nivel: string;
  modalidad: string;
  evaluador: string;
  fase: string;
}

const AprobacionCalificaciones: React.FC = () => {
  const navigate = useNavigate();

  // 👇 OJO: el router seguramente tiene :id, así que lo mapeamos a listaId
  const { id: listaId } = useParams<{ id: string }>();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [header, setHeader] = useState<HeaderDetalle | null>(null);
  const [calificaciones, setCalificaciones] = useState<CalificacionItem[]>([]);
  const [cargando, setCargando] = useState(true);

  const [modalRechazar, setModalRechazar] = useState(false);
  const [modalAprobar, setModalAprobar] = useState(false);
  const [justificacion, setJustificacion] = useState("");

  // =======================
  // Cargar datos del back
  // =======================
  useEffect(() => {
    const cargar = async () => {
      if (!listaId) {
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        const resp = await fetch(
          `${API_URL}/api/aprobacion-calificaciones/${listaId}`
        );
        const data = await resp.json();

        if (!resp.ok || !data.ok) {
          alert(data.mensaje ?? "No se pudo cargar el detalle de la lista.");
          setHeader(null);
          setCalificaciones([]);
          return;
        }

        setHeader(data.header);
        setCalificaciones(data.calificaciones);
      } catch (e) {
        console.error(e);
        alert("Error al cargar el detalle de la lista.");
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [listaId]);

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return calificaciones;
    const term = searchTerm.toLowerCase();
    return calificaciones.filter(
      (item) =>
        item.nombre.toLowerCase().includes(term) ||
        item.codigo.toLowerCase().includes(term) ||
        item.observacion.toLowerCase().includes(term)
    );
  }, [calificaciones, searchTerm]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const volverAListaDeListas = () => {
    navigate("/aprobacion-calificaciones");
  };

  const aprobarLista = async () => {
    if (!listaId) return;
    try {
      const resp = await fetch(
        `${API_URL}/api/aprobacion-calificaciones/${listaId}/aprobar`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
      );
      const data = await resp.json();
      if (!resp.ok || !data.ok) {
        alert(data.mensaje ?? "Error al aprobar la lista.");
        return;
      }
      alert(data.mensaje ?? "Lista aprobada exitosamente.");
      volverAListaDeListas();
    } catch (e) {
      console.error(e);
      alert("Error al aprobar la lista.");
    }
  };

  const rechazarLista = async () => {
    if (!listaId) return;
    if (!justificacion.trim()) {
      alert("Por favor, ingrese una justificación para rechazar la lista.");
      return;
    }
    try {
      const resp = await fetch(
        `${API_URL}/api/aprobacion-calificaciones/${listaId}/rechazar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ justificacion: justificacion.trim() }),
        }
      );
      const data = await resp.json();
      if (!resp.ok || !data.ok) {
        alert(data.mensaje ?? "Error al rechazar la lista.");
        return;
      }
      alert(data.mensaje ?? "Lista rechazada correctamente.");
      setJustificacion("");
      volverAListaDeListas();
    } catch (e) {
      console.error(e);
      alert("Error al rechazar la lista.");
    }
  };

  const columns = [
    {
      clave: "nombre",
      titulo: "Nombre Completo",
      alineacion: "izquierda" as const,
      formatearCelda: (_valor: any, fila: CalificacionItem) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center text-white font-bold text-xs">
            {fila.iniciales}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {fila.nombre}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Código: {fila.codigo}
            </p>
          </div>
        </div>
      ),
    },
    { clave: "codigo", titulo: "Código", alineacion: "centro" as const },
{
  clave: "estado",
  titulo: "Estado",
  alineacion: "centro" as const,
  // usamos la fila completa para poder ver la nota
  formatearCelda: (_valor: string, fila: CalificacionItem) => {
    // 🔹 Regla visual:
    // - Si BD dijo "Descalificado" → respetamos eso siempre
    // - Si nota >= 60 y NO está descalificado → mostrar "Clasificado"
    // - Si nota < 60 → "No clasificado"
    let label: string;

    if (fila.estado === "Descalificado") {
      label = "Descalificado";
    } else if (fila.nota >= 60) {
      label = "Clasificado";
    } else {
      label = "No clasificado";
    }

    return (
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full ${
          label === "Clasificado"
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            : label === "Descalificado"
            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
        }`}
      >
        {label}
      </span>
    );
  },
},

    {
      clave: "nota",
      titulo: "Nota",
      alineacion: "centro" as const,
      formatearCelda: (valor: number) => (
        <div className="inline-flex items-center justify-center w-16 px-3 py-1 text-sm font-bold text-gray-800 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-200">
          {valor}
        </div>
      ),
    },
    {
      clave: "observacion",
      titulo: "Observación",
      alineacion: "izquierda" as const,
      formatearCelda: (valor: string) => (
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
          {valor}
        </p>
      ),
    },
  ];

  return (
    <>
      <PageMeta
        title="Aprobación de Calificaciones | OH-SANSI"
        description="Revisión y aprobación de calificaciones enviadas por evaluadores"
      />
      <PageBreadcrumb pageTitle="Detalle de Calificaciones" />

      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 text-sm">
            <div>
              <span className="font-medium">Área:</span>{" "}
              {header?.area ?? "—"}
            </div>
            <div>
              <span className="font-medium">Nivel:</span>{" "}
              {header?.nivel ?? "—"}
            </div>
            <div>
              <span className="font-medium">Modalidad:</span>{" "}
              {header?.modalidad ?? "—"}
            </div>
            <div>
              <span className="font-medium">Evaluador:</span>{" "}
              {header?.evaluador ?? "—"}
            </div>
            <div>
              <span className="font-medium">Fase:</span>{" "}
              {header?.fase ?? "—"}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <BarraBusquedaAreas
              terminoBusqueda={searchTerm}
              onBuscarChange={(t) => {
                setSearchTerm(t);
                setCurrentPage(1);
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setModalRechazar(true)}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-full hover:bg-red-700 transition-all shadow-sm"
                disabled={cargando || calificaciones.length === 0}
              >
                Rechazar lista
              </button>
              <button
                onClick={() => setModalAprobar(true)}
                className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-full hover:bg-green-700 transition-all shadow-sm"
                disabled={cargando || calificaciones.length === 0}
              >
                Aprobar listas
              </button>
            </div>
          </div>

          {cargando ? (
            <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Cargando calificaciones...
            </div>
          ) : (
            <>
              <TablaBase
                datos={paginatedData}
                columnas={columns}
                conOrdenamiento={false}
                conAcciones={false}
              />

              <Paginacion
                paginaActual={currentPage}
                totalPaginas={
                  Math.ceil(filteredData.length / itemsPerPage) || 1
                }
                totalRegistros={filteredData.length}
                registrosPorPagina={itemsPerPage}
                onPaginaChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>

      {/* MODAL RECHAZO */}
      {modalRechazar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-gray-900/70 dark:bg-black/70"
            onClick={() => {
              setModalRechazar(false);
              setJustificacion("");
            }}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Justifique por qué rechaza la lista
            </h3>
            <textarea
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              placeholder="Ingrese su justificación"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              rows={5}
              autoFocus
            />
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => {
                  setModalRechazar(false);
                  setJustificacion("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setModalRechazar(false);
                  rechazarLista();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL APROBAR */}
      {modalAprobar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-gray-900/70 dark:bg-black/70"
            onClick={() => setModalAprobar(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              ¿Seguro que la lista es CORRECTA?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Una vez apruebe esta lista se publicará los resultados en la
              página.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalAprobar(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setModalAprobar(false);
                  aprobarLista();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AprobacionCalificaciones;
