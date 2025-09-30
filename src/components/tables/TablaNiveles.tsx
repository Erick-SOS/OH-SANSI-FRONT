import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

interface Nivel {
  id: number;
  nivel: string;
  responsable: string;
  modalidad: string;
}

interface TablaNivelesProps {
  datos: Nivel[];
  onEliminarFila: (id: number) => void;
  paginaActual: number;
  registrosPorPagina: number;
}

const TablaNiveles: React.FC<TablaNivelesProps> = ({ 
  datos, 
  onEliminarFila,
  paginaActual,
  registrosPorPagina
}) => {
  
  const getEstiloModalidad = (modalidad: string) => {
    const baseStyles = "px-2 py-1 rounded-full text-xs font-medium border";
    
    if (modalidad.toLowerCase() === "grupal") {
      return `${baseStyles} bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800`;
    } else if (modalidad.toLowerCase() === "individual") {
      return `${baseStyles} bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800`;
    }
    
    return `${baseStyles} bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800`;
  };

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
                Responsable de area
              </TableCell>

              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">
                Modalidad
              </TableCell>

              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">
                Acción
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {datos.map((item, index) => (
              <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-800 dark:text-white/90">
                  {(paginaActual - 1) * registrosPorPagina + index + 1}
                </TableCell>
                <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-800 dark:text-white/90">
                  {item.nivel}
                </TableCell>
                <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-800 dark:text-white/90">
                  {item.responsable}
                </TableCell>
                <TableCell className="px-5 py-4 text-start text-theme-sm">
                  <span className={getEstiloModalidad(item.modalidad)}>
                    {item.modalidad}
                  </span>
                </TableCell>
                <TableCell className="px-5 py-4 text-start text-theme-sm">
                  <button
                    onClick={() => onEliminarFila(item.id)}
                    className="p-1 text-black hover:bg-gray-200 rounded transition-colors dark:hover:bg-red-900/20"
                    title="Eliminar fila"
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