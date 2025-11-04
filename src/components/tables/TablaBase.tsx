import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

// Definir tipo específico para alineación
type TipoAlineacion = 'izquierda' | 'centro' | 'derecha';

interface ColumnaConfig {
  clave: string;
  titulo: string;
  alineacion?: TipoAlineacion; // Cambiado a TipoAlineacion
  ancho?: string;
  ordenable?: boolean;
  formatearCelda?: (valor: any, fila: any) => React.ReactNode;
}

interface TablaBaseProps {
  datos: any[];
  columnas: ColumnaConfig[];
  conOrdenamiento?: boolean;
  onOrdenar?: (columna: string, direccion: 'asc' | 'desc') => void;
  onEliminarFila?: (id: number) => void;
  conAcciones?: boolean;
  className?: string;
}

const TablaBase: React.FC<TablaBaseProps> = ({ 
  datos, 
  columnas, 
  conOrdenamiento = false,
  onOrdenar,
  onEliminarFila,
  conAcciones = false,
  className = ""
}) => {
  
  // Asegurar que la columna N° esté presente
  const columnasConNumero: ColumnaConfig[] = [
    {
      clave: 'numero',
      titulo: 'N°',
      alineacion: 'centro',
      ancho: 'w-16',
      ordenable: false
    },
    ...columnas
  ];

  const getAlineacionClase = (alineacion?: TipoAlineacion) => {
    switch (alineacion) {
      case 'centro': return 'text-center';
      case 'derecha': return 'text-right';
      default: return 'text-left';
    }
  };

  const renderizarContenidoCelda = (columna: ColumnaConfig, fila: any, index: number) => {
    if (columna.clave === 'numero') {
      return index + 1;
    }
    
    if (columna.formatearCelda) {
      return columna.formatearCelda(fila[columna.clave], fila);
    }
    
    return fila[columna.clave] || '-';
  };

  return (
    <div className={`overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] ${className}`}>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {columnasConNumero.map((columna) => (
                <TableCell 
                  key={columna.clave}
                  isHeader 
                  className={`px-5 py-3 font-medium text-gray-500 text-theme-base ${getAlineacionClase(columna.alineacion)} ${columna.ancho || ''}`}
                >
                  <div className={`flex items-center gap-1 ${columna.alineacion === 'centro' ? 'justify-center' : columna.alineacion === 'derecha' ? 'justify-end' : 'justify-start'}`}>
                    <span>{columna.titulo}</span>
                    
                    {conOrdenamiento && columna.ordenable !== false && onOrdenar && (
                      <div className="flex flex-col">
                        <button 
                          onClick={() => onOrdenar(columna.clave, 'asc')}
                          className="hover:text-blue-600 transition-colors text-xs"
                          title="Ordenar ascendente"
                        >
                          ↑
                        </button>
                        <button 
                          onClick={() => onOrdenar(columna.clave, 'desc')}
                          className="hover:text-blue-600 transition-colors text-xs"
                          title="Ordenar descendente"
                        >
                          ↓
                        </button>
                      </div>
                    )}
                  </div>
                </TableCell>
              ))}
              
              {conAcciones && (
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-base w-20">
                  Acción
                </TableCell>
              )}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {datos.map((fila, index) => (
              <TableRow key={fila.id || index} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                {columnasConNumero.map((columna) => (
                  <TableCell 
                    key={columna.clave}
                    className={`px-5 py-4 text-theme-sm text-gray-800 dark:text-white/90 ${getAlineacionClase(columna.alineacion)} ${columna.ancho || ''}`}
                  >
                    {renderizarContenidoCelda(columna, fila, index)}
                  </TableCell>
                ))}
                
                {conAcciones && onEliminarFila && (
                  <TableCell className="px-5 py-4 text-theme-sm">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onEliminarFila(fila.id)}
                        className="p-1 text-black hover:bg-gray-200 rounded transition-colors dark:hover:bg-red-900/20"
                        title="Eliminar fila"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TablaBase;