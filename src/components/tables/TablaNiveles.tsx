import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import { Nivel } from "../../api/niveles";

interface TablaNivelesProps {
  datos: Nivel[];
  onEliminarFila: (id: number, nombre: string) => void;
  paginaActual: number;
  registrosPorPagina: number;
}

const TablaNiveles: React.FC<TablaNivelesProps> = ({ 
  datos, 
  onEliminarFila,
  paginaActual,
  registrosPorPagina
}) => {
  
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">
                N°
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">
                Nivel
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">
                Codigo de nivel
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">
                Descripcion
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text evolutivos-500 text-start text-theme-xs">
                Acción
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {datos.map((item, index) => (
              <TableRow key={item.id || index} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-800 dark:text-white/90">
                  {(paginaActual - 1) * registrosPorPagina + index + 1}
                </TableCell>
                <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-800 dark:text-white/90">
                  {(item as any).nivel || item.nombre}
                </TableCell>
                <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-800 dark:text-white/90">
                  {item.codigo || 'Sin asignar'}
                </TableCell>
                <TableCell className="px-5 py-4 text-start text-theme-sm">
                  {item.descripcion || 'N/A'}
                </TableCell>
                <TableCell className="px-5 py-4 text-start text-theme-sm">
                  <button
                    onClick={() => item.id && onEliminarFila(item.id, (item as any).nivel || item.nombre)}
                    className="p-1 text-black hover:bg-gray-200 rounded transition-colors dark:hover:bg-red-900/20"
                    title="Eliminar fila"
                    disabled={!item.id}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TablaNiveles;