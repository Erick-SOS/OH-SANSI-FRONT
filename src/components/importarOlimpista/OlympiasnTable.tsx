import React from "react";

import { Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Olympian } from "../../types/olympista";

interface Props {
  pageRows: Olympian[];
  onDelete: (id: string) => void;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  filteredLength: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

export const OlympiansTable: React.FC<Props> = ({
  pageRows, onDelete, currentPage, totalPages, pageSize, filteredLength, setPage
}) => {
  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-3 py-3">OLIMPISTA</th>
            <th className="px-3 py-3">NOMBRE</th>
            <th className="px-3 py-3">APELLIDO PATERNO</th>
            <th className="px-3 py-3">UNIDAD EDUCATIVA</th>
            <th className="px-3 py-3">DEPARTAMENTO</th>
            <th className="px-3 py-3">ÁREA</th>
            <th className="px-3 py-3">NIVEL</th>
            <th className="px-3 py-3">EQUIPO</th>
            <th className="px-3 py-3">ROL</th>
            <th className="px-3 py-3 text-right">Acción</th>
          </tr>
        </thead>
        <tbody>
          {pageRows.length === 0 && (
            <tr>
              <td colSpan={10} className="px-4 py-6 text-center text-gray-500">
                Sin resultados
              </td>
            </tr>
          )}
          {pageRows.map((r) => (
            <tr key={r.id} className="border-t last:border-b">
              <td className="px-3 py-2">{r.TIPO_PART}</td>
              <td className="px-3 py-2">{r.OLI_NOMBRE}</td>
              <td className="px-3 py-2">{r.OLI_AP_PAT}</td>
              <td className="px-3 py-2">{r.OLI_UNID_EDU}</td>
              <td className="px-3 py-2">{r.OLI_DEPTO}</td>
              <td className="px-3 py-2">{r.AREA_NOM}</td>
              <td className="px-3 py-2">{r.NIVEL_NOM}</td>
              <td className="px-3 py-2">{r.EQUIPO_NOMBRE}</td>
              <td className="px-3 py-2">{r.ROL_EQUIPO}</td>
              <td className="px-3 py-2 text-right">
                <button
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                  onClick={() => onDelete(r.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer paginación */}
      <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-600">
        <span>
          Mostrando {pageRows.length ? (currentPage - 1) * pageSize + 1 : 0} a{" "}
          {(currentPage - 1) * pageSize + pageRows.length} de {filteredLength}
        </span>
        <div className="flex items-center gap-1">
          <button
            className="rounded-md border px-2 py-1 disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={`rounded-md border px-2 py-1 ${
                n === currentPage ? "bg-gray-900 text-white" : "bg-white"
              }`}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}
          <button
            className="rounded-md border px-2 py-1 disabled:opacity-40"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
