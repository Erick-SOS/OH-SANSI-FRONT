import React, { useEffect, useMemo, useState } from "react";
import { Search, Download, FileSpreadsheet } from "lucide-react";
import { ImportModal } from "./ImportModal";
import { Olympian } from "./types/olympista";
import { download, loadFromLS, saveToLS, toCSV } from "./helpers";
import { OlympiansTable } from "./OlympiasnTable";
import { uploadCSV } from "../../api/OlympiasService";

export const OlympiansListLocalprueba: React.FC = () => {
  const [rows, setRows] = useState<Olympian[]>([]);
  useEffect(() => {
    setRows(loadFromLS() ?? []);
  }, []);
  useEffect(() => {
    saveToLS(rows);
  }, [rows]);

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 7;

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter(r =>
      Object.values(r).some(v => String(v).toLowerCase().includes(t))
    );
  }, [rows, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const onExport = () => download("olimpistas.csv", toCSV(rows));
  const onDelete = (id: string) =>
    confirm("¿Eliminar este registro?") && setRows(p => p.filter(r => r.id !== id));

  const [openImport, setOpenImport] = useState(false);
  const [importOk, setImportOk] = useState<string | null>(null);
  const [importErr, setImportErr] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);


    // 🔹 Nuevos estados para errores detallados
  const [rowErrors, setRowErrors] = useState<any[]>([]);
  const [rowWarnings, setRowWarnings] = useState<any[]>([]);

  const onInputChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setImportOk(null);
    setImportErr(null);
  };

  const generateErrorCSV = () => {
    if (!rowErrors.length && !rowWarnings.length) return;

    const rows: string[] = [];
    rows.push("Tipo,Fila,Mensaje"); // encabezado

    rowWarnings.forEach(w =>
      rows.push(`Advertencia,${w.fila},"${w.mensaje.replace(/"/g, '""')}"`)
    );
    rowErrors.forEach(e =>
      rows.push(`Error,${e.fila},"${e.mensaje.replace(/"/g, '""')}"`)
    );

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "errores_importacion.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  // ✅ Nueva versión: usar el servicio uploadCSV()
  const onImport = async () => {
    if (!selectedFile) return setImportErr("Primero selecciona un archivo CSV.");
    setImportErr(null);
    setImportOk("Procesando archivo...");

    try {
      const response = await uploadCSV(selectedFile);

        if (response.ok) {
        setImportOk(response.mensaje_exito || "Archivo importado correctamente.");
        setImportErr(null);
      }

      // Guardar advertencias si las hay
      if (response.advertencias_por_fila?.length) {
        setRowWarnings(response.advertencias_por_fila);
      }

      // Guardar errores si los hay
      if (response.errores_por_fila?.length) {
        setRowErrors(response.errores_por_fila);
      }

      setSelectedFile(null);
    } catch (err: any) {
       console.error("❌ Error de importación:", err);
      setImportOk(null);
      console.log(rowErrors);
      setRowErrors(err?.errores_por_fila || []);
      setRowWarnings(err?.advertencias_por_fila || []);

      if (err?.mensaje) {
        setImportErr(`${err.mensaje}\n\nFaltantes: ${err.detalle?.faltantes?.join(", ") || "-"}`);
      } else if (err?.mensaje_error) {
        setImportErr(err.mensaje_error);
      } else {
        setImportErr("Error desconocido al importar el archivo.");
      }
      
    }
  };

  const downloadTemplate = () => {
    const headers = [
      "TIPO_PART", "AREA_COD", "AREA_NOM", "NIVEL_COD", "NIVEL_NOM", "OLI_TDOC",
      "OLI_NRODOC", "OLI_NOMBRE", "OLI_AP_PAT", "OLI_AP_MAT", "OLI_UNID_EDU",
      "OLI_DEPTO", "OLI_GRADO", "OLI_F_NAC", "OLI_SEXO", "OLI_CORREO",
      "TUTOR_TDOC", "TUTOR_NRODOC", "TUTOR_NOMBRE", "TUTOR_AP_PAT",
      "TUTOR_AP_MAT", "TUTOR_TEL", "TUTOR_CORREO", "TUTOR_UNID_EDU",
      "TUTOR_PROF", "EQUIPO_NOMBRE", "ROL_EQUIPO"
    ];
    const example =
      "Individual,MAT01,Matemáticas,PRI,Primario,CI,7329843,Julian,Alvarez,Torrez,Don Bosco,Cochabamba,6to,2013-05-20,M,julian@example.com,CI,5638291,Evan,Castañeda,Rojas,76483920,evan@example.com,Don Bosco,Profesor,Los Matemáticos,Capitán\n";
    download("plantilla_olimpistas.csv", headers.join(",") + "\n" + example);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Lista de Olimpistas</h1>
        <div className="flex gap-2">
          <button
            onClick={onExport}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
          >
            <Download className="h-4 w-4" /> Exportar
          </button>
          <button
            onClick={() => setOpenImport(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700"
          >
            <FileSpreadsheet className="h-4 w-4" /> Importar CSV
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-3 relative">
        <input
          value={q}
          onChange={e => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Buscar..."
          className="w-full rounded-lg border px-3 py-2 pl-9 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
      </div>

      {/* Table */}
      <OlympiansTable
        pageRows={pageRows}
        onDelete={onDelete}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        filteredLength={filtered.length}
        setPage={setPage}
      />

      {/* Modal Import */}
      {openImport && (
        <ImportModal
          importOk={importOk}
          importErr={importErr}
          onInputChange={onInputChange}
          onClose={() => {
            setOpenImport(false);
            setSelectedFile(null);
          }}
          onDownloadTemplate={downloadTemplate}
          onImport={onImport}
          onDownloadErrors={generateErrorCSV}
          hasErrors={rowErrors.length > 0 || rowWarnings.length > 0}
        />
      )}
    </div>
  );
};
