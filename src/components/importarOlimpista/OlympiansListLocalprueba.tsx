// src/components/importarOlimpista/OlympiansListLocalprueba.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import TablaBase from "../tables/TablaBase";
import Paginacion from "../../components/ui/Paginacion";
import BarraBusquedaAreas from "../../components/tables/BarraBusqueda";

/** URL del backend */
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

/* ------------------------- Tipos del backend ------------------------- */

type BackendInscrito = {
  idParticipacion: number;
  modalidad: "INDIVIDUAL" | "EQUIPO";
  estado: "CLASIFICADO" | "NO_CLASIFICADO" | "DESCALIFICADO";
  area: { id: number; nombre: string };
  nivel: { id: number; nombre: string };
  olimpista?: {
    id: number;
    nombreCompleto: string;
    ci: string;
    unidadEducativa: string;
    departamento: string;
  } | null;
  tutorLegal?: {
    id: number;
    nombreCompleto: string;
  } | null;
  equipo?: {
    id: number;
    nombre: string;
    unidadEducativa?: string;
    departamento?: string;
  } | null;
};

type BackendListResponse = {
  ok?: boolean;
  total: number;
  page: number;
  pageSize: number;
  data: BackendInscrito[];
};

/** Fila que usará la tabla */
type Row = {
  id: string;
  nombreCompleto: string;
  unidadEducativa: string;
  modalidad: string;
  departamento: string;
  areaCompetencia: string;
  nivel: string;
  tutorLegal: string;
};

type SortColumn = keyof Row | null;

/* ------------------------------- Componente ------------------------------- */

export const OlympiansListLocalprueba: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  /* --------------------- helpers para query del backend -------------------- */

  const buildSearchParams = () => {
    const params = new URLSearchParams();
    params.set("tipo", "INDIVIDUAL"); // 👈 solo individuales
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (q.trim()) params.set("search", q.trim());
    return params;
  };

  /* -------------------------- Cargar desde backend ------------------------- */

  useEffect(() => {
    const fetchInscritos = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const params = buildSearchParams();
        const res = await fetch(
          `${API_URL}/api/inscritos?${params.toString()}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json: BackendListResponse = await res.json();
        setTotal(json.total);

        const mapped: Row[] = json.data.map((i) => {
          const persona = i.olimpista ?? null;
          const equipo = i.equipo ?? null;

          return {
            id: String(i.idParticipacion),
            nombreCompleto: persona?.nombreCompleto ?? equipo?.nombre ?? "",
            unidadEducativa:
              persona?.unidadEducativa ?? equipo?.unidadEducativa ?? "",
            modalidad: i.modalidad === "INDIVIDUAL" ? "INDIVIDUAL" : "EQUIPO",
            departamento: persona?.departamento ?? equipo?.departamento ?? "",
            areaCompetencia: i.area.nombre,
            nivel: i.nivel.nombre,
            tutorLegal: i.tutorLegal?.nombreCompleto ?? "",
          };
        });

        setRows(mapped);
      } catch (err) {
        console.error("Error cargando inscritos", err);
        setErrorMsg("No se pudieron cargar los inscritos desde el servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchInscritos();
  }, [page, q, pageSize]);

  /* -------------------- ordenamiento en la página actual ------------------- */

  const sortedRows = useMemo(() => {
    const result = [...rows];
    if (!sortColumn) return result;

    result.sort((a, b) => {
      const aVal = a[sortColumn] ?? "";
      const bVal = b[sortColumn] ?? "";
      const A = String(aVal).toLowerCase();
      const B = String(bVal).toLowerCase();
      if (A < B) return sortDirection === "asc" ? -1 : 1;
      if (A > B) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [rows, sortColumn, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = page;

  const handleSort = (columna: string, direccion: "asc" | "desc") => {
    const col = columna as SortColumn;
    if (sortColumn === col) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDirection(direccion);
    }
  };

  /* ------------------------------ Exportar --------------------------------- */

  const handleExportExcel = () => {
    const params = buildSearchParams();
    window.open(
      `${API_URL}/api/inscritos/export/excel?${params.toString()}`,
      "_blank"
    );
  };

  const handleExportPdf = () => {
    const params = buildSearchParams();
    window.open(
      `${API_URL}/api/inscritos/export/pdf?${params.toString()}`,
      "_blank"
    );
  };

  /* ------------------------------ Columnas UI ------------------------------ */

  const columnas = [
    {
      clave: "nombreCompleto",
      titulo: "Nombre Completo",
      alineacion: "izquierda" as const,
      ordenable: true,
    },
    {
      clave: "unidadEducativa",
      titulo: "Unidad Educativa",
      alineacion: "izquierda" as const,
      ordenable: true,
    },
    {
      clave: "modalidad",
      titulo: "Modalidad",
      alineacion: "izquierda" as const,
      ordenable: true,
    },
    {
      clave: "departamento",
      titulo: "Departamento",
      alineacion: "izquierda" as const,
      ordenable: true,
    },
    {
      clave: "areaCompetencia",
      titulo: "Área de Competencia",
      alineacion: "izquierda" as const,
      ordenable: true,
    },
    {
      clave: "nivel",
      titulo: "Nivel",
      alineacion: "izquierda" as const,
      ordenable: true,
    },
    {
      clave: "tutorLegal",
      titulo: "Tutor Legal",
      alineacion: "izquierda" as const,
      ordenable: true,
    },
  ];

  /* -------------------------------- Render -------------------------------- */

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      <div className="mb-12">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-0">
            Lista de Olimpistas
          </h1>
          <div className="flex gap-2">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
            >
              <Download className="w-4 h-4" /> Exportar Excel
            </button>
            <button
              onClick={handleExportPdf}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white bg-[#465FFF] rounded-lg hover:bg-[#3a4fe6]"
            >
              <FileSpreadsheet className="w-4 h-4" /> Exportar PDF
            </button>
          </div>
        </div>

        {/* BARRA DE BÚSQUEDA */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm mb-4">
          <div className="flex-1 max-w-md">
            <BarraBusquedaAreas
              terminoBusqueda={q}
              onBuscarChange={(t) => {
                setQ(t);
                setPage(1);
              }}
            />
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
            Cargando inscritos...
          </div>
        )}

        {/* ERROR */}
        {errorMsg && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        {/* TABLA */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <TablaBase
            datos={sortedRows}
            columnas={columnas}
            conOrdenamiento={true}
            onOrdenar={handleSort}
            conAcciones={false}
          />
        </div>

        {/* PAGINACIÓN */}
        <div className="mt-4">
          <Paginacion
            paginaActual={currentPage}
            totalPaginas={totalPages}
            totalRegistros={total}
            registrosPorPagina={pageSize}
            onPaginaChange={setPage}
          />
        </div>
      </div>
    </div>
  );
};

export default OlympiansListLocalprueba;
