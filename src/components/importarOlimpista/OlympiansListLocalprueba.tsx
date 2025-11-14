// src/components/importarOlimpista/OlympiansListLocalprueba.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Download, FileSpreadsheet, Trash2 } from "lucide-react";
import { ImportModal } from "./ImportModal";
import EliminarFilaModal from "../ui/modal/EliminarFilaModal"; // TU MODAL
import { Olympian } from "./types/olympista";
import { download } from "./helpers";
import TablaBase from "../tables/TablaBase";
import Paginacion from "../../components/ui/Paginacion";
import BarraBusquedaAreas from "../../components/tables/BarraBusqueda";

const STORAGE_KEY = "olimpistas_local";

export const OlympiansListLocalprueba: React.FC = () => {
  const [rows, setRows] = useState<Olympian[]>([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const pageSize = 7;

  // Cargar desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setRows(JSON.parse(saved));
      } catch {
        setRows([]);
      }
    }
  }, []);

  // Filtrado y ordenamiento
  const filteredAndSorted = useMemo(() => {
    let result = [...rows];

    if (q.trim()) {
      const term = q.toLowerCase();
      result = result.filter(row =>
        Object.values(row).some(v => String(v).toLowerCase().includes(term))
      );
    }

    if (sortColumn) {
      result.sort((a, b) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const aVal = (a as any)[sortColumn] || "";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bVal = (b as any)[sortColumn] || "";
        const compare = String(aVal).localeCompare(String(bVal));
        return sortDirection === 'asc' ? compare : -compare;
      });
    }

    return result;
  }, [rows, q, sortColumn, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filteredAndSorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (columna: string, direccion: 'asc' | 'desc') => {
    if (sortColumn === columna) {
      setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortColumn(columna);
      setSortDirection(direccion);
    }
    setPage(1);
  };

  const onExport = () => {
    const headers = [
      "TIPO_PART", "AREA_COD", "AREA_NOM", "NIVEL_COD", "NIVEL_NOM", "OLI_TDOC",
      "OLI_NRODOC", "OLI_NOMBRE", "OLI_AP_PAT", "OLI_AP_MAT", "OLI_UNID_EDU",
      "OLI_DEPTO", "OLI_GRADO", "OLI_F_NAC", "OLI_SEXO", "OLI_CORREO",
      "TUTOR_TDOC", "TUTOR_NRODOC", "TUTOR_NOMBRE", "TUTOR_AP_PAT",
      "TUTOR_AP_MAT", "TUTOR_TEL", "TUTOR_CORREO", "TUTOR_UNID_EDU",
      "TUTOR_PROF", "EQUIPO_NOMBRE", "ROL_EQUIPO"
    ];
    const csv = [
      headers.join(","),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...rows.map(r => headers.map(h => `"${(r as any)[h] || ""}"`).join(","))
    ].join("\n");
    download("olimpistas.csv", csv);
  };

  // ESTADO PARA MODAL DE ELIMINAR
  const [modalEliminar, setModalEliminar] = useState<{
    isOpen: boolean;
    id: string | null;
    nombre: string;
  }>({ isOpen: false, id: null, nombre: "" });

  const confirmarEliminacion = () => {
    if (modalEliminar.id) {
      const updated = rows.filter(r => r.id !== modalEliminar.id);
      setRows(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    setModalEliminar({ isOpen: false, id: null, nombre: "" });
  };

  // IMPORTACIÓN
  const [openImport, setOpenImport] = useState(false);
  const [importOk, setImportOk] = useState<string | null>(null);
  const [importErr, setImportErr] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rowErrors, setRowErrors] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rowWarnings, setRowWarnings] = useState<any[]>([]);

  const onInputChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setImportOk(null);
    setImportErr(null);
    setRowErrors([]);
    setRowWarnings([]);
  };

  const generateErrorCSV = () => {
    if (!rowErrors.length && !rowWarnings.length) return;
    const lines = ["Tipo,Fila,Mensaje"];
    rowWarnings.forEach(w => lines.push(`Advertencia,${w.fila},"${w.mensaje.replace(/"/g, '""')}"`));
    rowErrors.forEach(e => lines.push(`Error,${e.fila},"${e.mensaje.replace(/"/g, '""')}"`));
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "errores_importacion.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): string[][] => {
    const lines = text.split(/\r\n|\n|\r/).filter(l => l.trim());
    const result: string[][] = [];
    let inQuotes = false;
    let current = "";
    let row: string[] = [];

    for (const line of lines) {
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const next = line[i + 1];
        if (char === '"') {
          if (inQuotes && next === '"') { current += '"'; i++; }
          else inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          row.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      if (!inQuotes) {
        row.push(current.trim());
        if (row.some(c => c !== "")) result.push(row);
        row = []; current = "";
      } else current += "\n";
    }
    return result;
  };

  const onImport = () => {
    if (!selectedFile) return setImportErr("Selecciona un archivo.");

    setImportErr(null);
    setImportOk("Procesando...");
    setRowErrors([]);
    setRowWarnings([]);

    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      if (!text) return setImportErr("No se pudo leer el archivo.");

      try {
        const parsed = parseCSV(text);
        if (parsed.length < 2) return setImportErr("CSV vacío.");

        const dataRows = parsed.slice(1);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newErrors: any[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newWarnings: any[] = [];
        const newOlympians: Olympian[] = [];

        dataRows.forEach((row, idx) => {
          const required = ["OLI_NRODOC", "OLI_NOMBRE", "OLI_AP_PAT", "OLI_F_NAC", "OLI_SEXO"];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const errors: any[] = [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const warnings: any[] = [];

          required.forEach((field, i) => {
            if (!row[i] || row[i].trim() === "") {
              errors.push({ fila: idx + 2, mensaje: `Falta: ${field}` });
            }
          });

          if (row[15] && !row[15].includes("@")) {
            warnings.push({ fila: idx + 2, mensaje: `Correo inválido: ${row[15]}` });
          }

          newErrors.push(...errors);
          newWarnings.push(...warnings);

          if (errors.length === 0) {
            newOlympians.push({
              id: `${Date.now()}-${idx}`,
              TIPO_PART: row[0] || "",
              AREA_COD: row[1] || "",
              AREA_NOM: row[2] || "",
              NIVEL_COD: row[3] || "",
              NIVEL_NOM: row[4] || "",
              OLI_TDOC: row[5] || "",
              OLI_NRODOC: row[6] || "",
              OLI_NOMBRE: row[7] || "",
              OLI_AP_PAT: row[8] || "",
              OLI_AP_MAT: row[9] || "",
              OLI_UNID_EDU: row[10] || "",
              OLI_DEPTO: row[11] || "",
              OLI_GRADO: row[12] || "",
              OLI_F_NAC: row[13] || "",
              OLI_SEXO: row[14] || "",
              OLI_CORREO: row[15] || "",
              TUTOR_TDOC: row[16] || "",
              TUTOR_NRODOC: row[17] || "",
              TUTOR_NOMBRE: row[18] || "",
              TUTOR_AP_PAT: row[19] || "",
              TUTOR_AP_MAT: row[20] || "",
              TUTOR_TEL: row[21] || "",
              TUTOR_CORREO: row[22] || "",
              TUTOR_UNID_EDU: row[23] || "",
              TUTOR_PROF: row[24] || "",
              EQUIPO_NOMBRE: row[25] || "",
              ROL_EQUIPO: row[26] || "",
            });
          }
        });

        setRowErrors(newErrors);
        setRowWarnings(newWarnings);

        if (newErrors.length > 0) {
          setImportErr(`Errores: ${newErrors.length}`);
          setImportOk(null);
        } else {
          setImportOk(`Cargado correctamente ${newOlympians.length} registro(s)`);
        }

        if (newOlympians.length > 0) {
          const updated = [...rows, ...newOlympians];
          setRows(updated);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }

        setSelectedFile(null);
        setTimeout(() => {
          setOpenImport(false);
          setImportOk(null);
          setImportErr(null);
          setRowErrors([]);
          setRowWarnings([]);
        }, 1000);

      } catch {
        setImportErr("Error al procesar CSV.");
        setTimeout(() => setOpenImport(false), 1500);
      }
    };

    reader.onerror = () => {
      setImportErr("Error de lectura.");
      setTimeout(() => setOpenImport(false), 1500);
    };

    reader.readAsText(selectedFile, "UTF-8");
  };

  const columnas = [
    {
      clave: "OLI_NOMBRE",
      titulo: "Nombre Completo",
      alineacion: "izquierda" as const,
      ordenable: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatearCelda: (_: any, fila: Olympian) =>
        `${fila.OLI_NOMBRE} ${fila.OLI_AP_PAT} ${fila.OLI_AP_MAT || ""}`.trim()
    },
    { clave: "OLI_UNID_EDU", titulo: "Unidad Educativa", alineacion: "izquierda" as const, ordenable: true },
    { clave: "NIVEL_NOM", titulo: "Modalidad", alineacion: "izquierda" as const, ordenable: true },
    { clave: "OLI_DEPTO", titulo: "Departamento", alineacion: "izquierda" as const, ordenable: true },
    { clave: "AREA_NOM", titulo: "Área de Competencia", alineacion: "izquierda" as const, ordenable: true },
    { clave: "NIVEL_COD", titulo: "Nivel", alineacion: "centro" as const, ordenable: true },
    {
      clave: "TUTOR_NOMBRE",
      titulo: "Tutor Legal",
      alineacion: "izquierda" as const,
      ordenable: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatearCelda: (_: any, fila: Olympian) =>
        `${fila.TUTOR_NOMBRE} ${fila.TUTOR_AP_PAT} ${fila.TUTOR_AP_MAT || ""}`.trim()
    },
  ];

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      <div className="mb-12">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-0">
            Lista de Olimpistas
          </h1>
          <div className="flex gap-2">
            <button onClick={onExport} className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200">
              <Download className="w-4 h-4" /> Exportar
            </button>
            <button onClick={() => setOpenImport(true)} className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white bg-[#465FFF] rounded-lg hover:bg-[#3a4fe6]">
              <FileSpreadsheet className="w-4 h-4" /> Importar CSV
            </button>
          </div>
        </div>

        {/* BARRA DE BÚSQUEDA */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm mb-4">
          <div className="flex-1 max-w-md">
            <BarraBusquedaAreas
              terminoBusqueda={q}
              onBuscarChange={(t) => { setQ(t); setPage(1); }}
            />
          </div>
        </div>

        {/* TABLA */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <TablaBase
            datos={pageRows}
            columnas={columnas}
            conOrdenamiento={true}
            onOrdenar={handleSort}
            conAcciones={true}
            renderAcciones={(fila) => (
              <button
                onClick={() => {
                  const nombre = `${fila.OLI_NOMBRE} ${fila.OLI_AP_PAT} ${fila.OLI_AP_MAT || ""}`.trim();
                  setModalEliminar({ isOpen: true, id: fila.id, nombre });
                }}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          />
        </div>

        {/* PAGINACIÓN */}
        <div className="mt-4">
          <Paginacion
            paginaActual={currentPage}
            totalPaginas={totalPages}
            totalRegistros={filteredAndSorted.length}
            registrosPorPagina={pageSize}
            onPaginaChange={setPage}
          />
        </div>
      </div>

      {/* MODAL IMPORTAR */}
      {openImport && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => {
            setOpenImport(false);
            setSelectedFile(null);
            setRowErrors([]);
            setRowWarnings([]);
          }}
        >
          <div 
            className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl ring-1 ring-gray-200 dark:ring-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <ImportModal
              importOk={importOk}
              importErr={importErr}
              onInputChange={onInputChange}
              onClose={() => {
                setOpenImport(false);
                setSelectedFile(null);
                setRowErrors([]);
                setRowWarnings([]);
              }}
              onImport={onImport}
              onDownloadErrors={generateErrorCSV}
              hasErrors={rowErrors.length > 0 || rowWarnings.length > 0}
            />
          </div>
        </div>
      )}

      {/* MODAL DE ELIMINAR - USANDO TU EliminarFilaModal */}
      <EliminarFilaModal
        isOpen={modalEliminar.isOpen}
        onClose={() => setModalEliminar({ isOpen: false, id: null, nombre: "" })}
        onConfirm={confirmarEliminacion}
        tipo=""
        nombre={modalEliminar.nombre}
      />
    </div>
  );
};