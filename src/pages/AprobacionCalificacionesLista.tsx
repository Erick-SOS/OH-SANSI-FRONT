// src/pages/AprobacionCalificacionesLista.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";

const API_URL =
  import.meta.env.VITE_API_URL || "https://back-oh-sansi.vercel.app";

// 🔹 OJO: por ahora dejamos fijo el área Física (id = 2).
// Cuando tengas el área seleccionada en otro lado, solo reemplazas este valor.
const AREA_ID_FISICA = 2;

interface ListaPendiente {
  id: string;
  areaId: number;
  areaNombre: string;
  nivelId: number;
  nivelNombre: string;
  modalidad: "INDIVIDUAL" | "EQUIPO";
  faseId: number;
  faseNombre: string;
  evaluadorId: number;
  evaluadorNombre: string;
  fechaEnviado: string; // ISO
  totalItems: number;
}

type FaseClave = "CLASIFICATORIA" | "FINAL";

const FASE_IDS: Record<FaseClave, number> = {
  CLASIFICATORIA: 1,
  FINAL: 2,
};

const AprobacionCalificacionesLista: React.FC = () => {
  const navigate = useNavigate();

  const [listasPendientes, setListasPendientes] = useState<ListaPendiente[]>([]);
  const [cargando, setCargando] = useState(true);

  // 🔹 estado de pestaña seleccionada (fase)
  const [faseSeleccionada, setFaseSeleccionada] =
    useState<FaseClave>("CLASIFICATORIA");

  // ==========================
  // Cargar listas del backend
  // ==========================
  const cargarListas = async (fase: FaseClave) => {
    try {
      setCargando(true);
      const faseId = FASE_IDS[fase];
      const url = `${API_URL}/api/aprobacion-calificaciones/listas-pendientes?areaId=${AREA_ID_FISICA}&faseId=${faseId}`;

      const resp = await fetch(url);
      const data = await resp.json();

      if (!resp.ok || !data.ok) {
        alert(
          data.mensaje ??
            "No se pudieron obtener las listas de calificaciones pendientes."
        );
        setListasPendientes([]);
        return;
      }

      setListasPendientes(data.listas);
    } catch (e) {
      console.error(e);
      alert("Error al cargar las listas pendientes.");
      setListasPendientes([]);
    } finally {
      setCargando(false);
    }
  };

  // Cargar al inicio con fase CLASIFICATORIA
  useEffect(() => {
    cargarListas(faseSeleccionada);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cambiarFase = (fase: FaseClave) => {
    if (fase === faseSeleccionada) return;
    setFaseSeleccionada(fase);
    cargarListas(fase);
  };

  const handleGenerarLista = () => {
    // 🔹 Por ahora sigue siendo solo maqueta (como antes).
    // Más adelante aquí llamarías al endpoint que genere el PDF.
    alert(
      "Generar lista de clasificados (este botón sigue siendo solo de maqueta por ahora)."
    );
  };

  const formatearFecha = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  return (
    <>
      <PageMeta
        title="Aprobación de Calificaciones | OH-SANSI"
        description="Listado de listas de calificaciones pendientes de aprobación por el administrador"
      />
      <PageBreadcrumb pageTitle="Aprobación de Calificaciones" />

      <div className="space-y-8">
        {/* SECCIÓN SUPERIOR: TÍTULO + FASE + BOTÓN GENERAR */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Calificaciones del área:{" "}
                <span className="text-blue-600">
                  {listasPendientes[0]?.areaNombre ?? "Física"}
                </span>
              </h1>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Fase de la olimpiada
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => cambiarFase("CLASIFICATORIA")}
                    className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all ${
                      faseSeleccionada === "CLASIFICATORIA"
                        ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200"
                        : "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700 dark:text-gray-400"
                    }`}
                  >
                    Fase de Clasificación
                  </button>
                  <button
                    type="button"
                    onClick={() => cambiarFase("FINAL")}
                    className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all ${
                      faseSeleccionada === "FINAL"
                        ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200"
                        : "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700 dark:text-gray-400"
                    }`}
                  >
                    Fase de Final
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerarLista}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
            >
              Generar lista de clasificados
            </button>
          </div>

          <hr className="border-gray-200 dark:border-gray-700 mb-8" />

          {/* LISTA DE PENDIENTES */}
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Listas de calificaciones pendientes de aprobación
          </h2>

          {cargando ? (
            <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Cargando listas pendientes...
            </div>
          ) : listasPendientes.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No hay listas pendientes de aprobación para esta fase.
            </div>
          ) : (
            <>
              <div className="grid gap-5">
                {listasPendientes.map((lista) => (
                  <div
                    key={lista.id}
                    onClick={() =>
                      navigate(`/aprobacion-calificaciones/${lista.id}`)
                    }
                    className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-xl p-6 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Área:
                        </span>{" "}
                        <strong className="text-gray-900 dark:text-white">
                          {lista.areaNombre}
                        </strong>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Nivel:
                        </span>{" "}
                        <strong className="text-gray-900 dark:text-white">
                          {lista.nivelNombre}
                        </strong>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Modalidad:
                        </span>{" "}
                        <strong className="text-gray-900 dark:text-white">
                          {lista.modalidad === "INDIVIDUAL"
                            ? "Individual"
                            : "Equipo"}
                        </strong>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Fase:
                        </span>{" "}
                        <strong className="text-gray-900 dark:text-white">
                          {lista.faseNombre}
                        </strong>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Evaluador:
                        </span>{" "}
                        <strong className="text-gray-900 dark:text-white">
                          {lista.evaluadorNombre}
                        </strong>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Enviado:
                        </span>{" "}
                        <strong className="text-gray-900 dark:text-white">
                          {formatearFecha(lista.fechaEnviado)}
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                Mostrando {listasPendientes.length} de{" "}
                {listasPendientes.length} listas
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AprobacionCalificacionesLista;
