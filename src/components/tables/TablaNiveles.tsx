// src/components/tables/TablaNiveles.tsx
import React, { useState, useMemo } from 'react';
import TablaBase from './TablaBase';
import { Nivel } from '../../api/niveles';

type NivelConAlias = Nivel & {
  nivel: string;
  numero: number;
};

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
  registrosPorPagina,
}) => {
  const [columnaOrdenada, setColumnaOrdenada] = useState<string | null>(null);
  const [direccionOrden, setDireccionOrden] = useState<'asc' | 'desc'>('asc');

  const handleOrdenar = (columna: string, nuevaDireccion: 'asc' | 'desc') => {
    if (columnaOrdenada === columna) {
      setDireccionOrden(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setColumnaOrdenada(columna);
      setDireccionOrden(nuevaDireccion);
    }
  };

  const datosOrdenados = useMemo(() => {
    if (!columnaOrdenada) return datos;

    return [...datos].sort((a, b) => {
      let valA = '';
      let valB = '';

      switch (columnaOrdenada) {
        case 'nivel':
          valA = (a.nombre || '').toLowerCase();
          valB = (b.nombre || '').toLowerCase();
          break;
        case 'codigo':
          valA = (a.codigo || '').toLowerCase();
          valB = (b.codigo || '').toLowerCase();
          break;
        case 'descripcion':
          valA = (a.descripcion || '').toLowerCase();
          valB = (b.descripcion || '').toLowerCase();
          break;
        default:
          return 0;
      }

      const comparacion = valA.localeCompare(valB);
      return direccionOrden === 'asc' ? comparacion : -comparacion;
    });
  }, [datos, columnaOrdenada, direccionOrden]);

  const datosParaTabla: NivelConAlias[] = datosOrdenados.map((item, index) => ({
    ...item,
    nivel: item.nombre || '-',
    codigo: item.codigo || 'Sin asignar',
    descripcion: item.descripcion || 'N/A',
    numero: (paginaActual - 1) * registrosPorPagina + index + 1,
  }));

  const columnas = [
    {
      clave: 'nivel' as keyof NivelConAlias,
      titulo: 'Nivel',
      alineacion: 'izquierda' as const,
      ordenable: true,
    },
    {
      clave: 'codigo' as keyof NivelConAlias,
      titulo: 'Código de nivel',
      alineacion: 'izquierda' as const,
      ordenable: true,
    },
    {
      clave: 'descripcion' as keyof NivelConAlias,
      titulo: 'Descripción',
      alineacion: 'izquierda' as const,
      ordenable: true,
    },
  ];

  const renderAcciones = (fila: NivelConAlias) => (
    <button
      onClick={() => fila.id && onEliminarFila(fila.id, fila.nivel)}
      className="p-1 rounded transition-colors 
                 text-gray-600 hover:text-red-600 hover:bg-red-50
                 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20"
      title="Eliminar fila"
      disabled={!fila.id}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1v3M4 7h16"
        />
      </svg>
    </button>
  );

  return (
    <TablaBase<NivelConAlias>
      datos={datosParaTabla}
      columnas={columnas}
      conOrdenamiento={true}
      onOrdenar={handleOrdenar}
      conAcciones={true}
      renderAcciones={renderAcciones}
      sortColumn={columnaOrdenada}
      sortDirection={direccionOrden}
    />
  );
};

export default TablaNiveles;