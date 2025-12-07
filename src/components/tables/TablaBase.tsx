// src/components/tables/TablaBase.tsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

type TipoAlineacion = 'izquierda' | 'centro' | 'derecha';

interface ColumnaConfig<T = any> {
  clave: string;
  titulo: string;
  alineacion?: TipoAlineacion;
  ancho?: string;
  ordenable?: boolean;
  formatearCelda?: (valor: any, fila: T) => React.ReactNode;
}

interface TablaBaseProps<T = any> {
  datos: T[];
  columnas: ColumnaConfig<T>[];
  conOrdenamiento?: boolean;
  onOrdenar?: (columna: string, direccion: 'asc' | 'desc') => void;
  conAcciones?: boolean;
  renderAcciones?: (fila: T) => React.ReactNode;
  className?: string;
  tituloNumero?: string;
  // NUEVA PROP: permite colorear toda la fila según el dato
  claseFila?: (fila: T) => string;
}

const TablaBase: React.FC<TablaBaseProps> = ({
  datos,
  columnas,
  conOrdenamiento = false,
  onOrdenar,
  conAcciones = false,
  renderAcciones,
  className = "",
  tituloNumero = "N°",
  claseFila,
}) => {

  const columnasConNumero: ColumnaConfig[] = [
    {
      clave: 'numero',
      titulo: tituloNumero,
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
    if (columna.clave === 'numero') return index + 1;
    if (columna.formatearCelda) return columna.formatearCelda(fila[columna.clave], fila);
    return fila[columna.clave] ?? '-';
  };

  return (
    <div className={`overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] ${className}`}>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {columnasConNumero.map((columna) => (
                <TableCell key={columna.clave} isHeader
                  className={`px-5 py-3 font-medium text-gray-500 text-theme-base ${getAlineacionClase(columna.alineacion)} ${columna.ancho || ''}`}
                >
                  <div className={`flex items-center gap-1 ${columna.alineacion === 'centro' ? 'justify-center' : columna.alineacion === 'derecha' ? 'justify-end' : 'justify-start'}`}>
                    <span>{columna.titulo}</span>
                    {conOrdenamiento && columna.ordenable !== false && onOrdenar && (
                      <div className="flex flex-col">
                      <button
                        onClick={() => onOrdenar(columna.clave, 'asc')}
                        className="hover:text-blue-600 transition-colors"
                        title="Ordenar ascendente"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onOrdenar(columna.clave, 'desc')}
                        className="hover:text-blue-600 transition-colors"
                        title="Ordenar descendente"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                    )}
                  </div>
                </TableCell>
              ))}
              {conAcciones && <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-base w-32 text-center">Acción</TableCell>}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {datos.map((fila, index) => {
              const clasePersonalizada = claseFila ? claseFila(fila) : '';
              return (
                <TableRow
                  key={fila.id || index}
                  className={`hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors ${clasePersonalizada}`}
                >
                  {columnasConNumero.map((columna) => (
                    <TableCell
                      key={columna.clave}
                      className={`px-5 py-4 text-theme-sm text-gray-800 dark:text-white/90 ${getAlineacionClase(columna.alineacion)} ${columna.ancho || ''}`}
                    >
                      {renderizarContenidoCelda(columna, fila, index)}
                    </TableCell>
                  ))}
                  {conAcciones && (
                    <TableCell className="px-5 py-4 text-center">
                      {renderAcciones ? renderAcciones(fila) : null}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TablaBase;