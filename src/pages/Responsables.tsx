import React, { useState, useMemo } from 'react';
import TablaBase from '../components/tables/TablaBase';
import Paginacion from '../components/ui/Paginacion';
import BarraBusquedaAreas from '../components/tables/BarraBusqueda';
import ConfirmarModal from '../components/ui/modal/ConfirmarModal';
import { FiSave, FiTrash2, FiEdit3 } from 'react-icons/fi';

interface Categoria {
  id: number;
  area: string;
  nivel: string;
  responsable: string;
  modalidad: 'Individual' | 'Grupal';
}

const responsablesDisponibles = [
  'Juan Pérez', 'María Gómez', 'Carlos Ruiz', 'Ana López', 'Luis Torres', 'Sofía Martínez'
];

const Responsables: React.FC = () => {
  const [categoriasOriginales] = useState<Categoria[]>([
    { id: 1, area: 'Biología', nivel: 'Secundaria', responsable: '', modalidad: 'Individual' },
    { id: 2, area: 'Matemática', nivel: 'Primaria', responsable: 'Juan Pérez', modalidad: 'Grupal' },
    { id: 3, area: 'Física', nivel: 'Secundaria', responsable: '', modalidad: 'Individual' },
    { id: 4, area: 'Química', nivel: 'Secundaria', responsable: '', modalidad: 'Individual' },
    { id: 5, area: 'Historia', nivel: 'Primaria', responsable: '', modalidad: 'Grupal' },
    { id: 6, area: 'Geografía', nivel: 'Secundaria', responsable: '', modalidad: 'Individual' },
    { id: 7, area: 'Lenguaje', nivel: 'Primaria', responsable: '', modalidad: 'Grupal' },
    { id: 8, area: 'Inglés', nivel: 'Secundaria', responsable: 'María Gómez', modalidad: 'Individual' },
    { id: 9, area: 'Arte', nivel: 'Primaria', responsable: '', modalidad: 'Grupal' },
    { id: 10, area: 'Educación Física', nivel: 'Secundaria', responsable: '', modalidad: 'Individual' },
    { id: 11, area: 'Informática', nivel: 'Secundaria', responsable: '', modalidad: 'Grupal' },
    { id: 12, area: 'Música', nivel: 'Primaria', responsable: '', modalidad: 'Individual' },
    { id: 13, area: 'Ciencias Naturales', nivel: 'Primaria', responsable: '', modalidad: 'Grupal' },
    { id: 14, area: 'Filosofía', nivel: 'Secundaria', responsable: '', modalidad: 'Individual' },
    { id: 15, area: 'Robótica', nivel: 'Secundaria', responsable: '', modalidad: 'Grupal' },
  ]);

  const [categorias, setCategorias] = useState<Categoria[]>(categoriasOriginales);
  const [paginaActual, setPaginaActual] = useState(1);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [editando, setEditando] = useState<Set<number>>(new Set());
  const [guardado, setGuardado] = useState<Set<number>>(new Set());
  const [modalEliminar, setModalEliminar] = useState<number | null>(null);

  const registrosPorPagina = 10;

  // === ORDENAMIENTO ===
  const handleOrdenar = (columna: string, direccion: 'asc' | 'desc') => {
    const sorted = [...categorias].sort((a, b) => {
      const valA = a[columna as keyof Categoria] as string;
      const valB = b[columna as keyof Categoria] as string;
      return direccion === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
    setCategorias(sorted);
    setPaginaActual(1);
  };

  // === COLUMNAS ===
  const columnas = [
    { clave: 'area', titulo: 'Área', alineacion: 'izquierda' as const, ordenable: true },
    { clave: 'nivel', titulo: 'Nivel', alineacion: 'izquierda' as const, ordenable: true },
    {
      clave: 'responsable',
      titulo: 'Responsable',
      alineacion: 'centro' as const,
      ordenable: true,
      formatearCelda: (valor: string, fila: Categoria) => {
        const estaEditando = editando.has(fila.id);

        if (estaEditando) {
          return (
            <select
              defaultValue={valor}
              onChange={(e) => {
                const nuevo = e.target.value;
                setCategorias(prev => prev.map(c =>
                  c.id === fila.id ? { ...c, responsable: nuevo } : c
                ));
                setEditando(s => new Set(s).add(fila.id));
              }}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              autoFocus
            >
              <option value="">Seleccionar evaluador</option>
              {responsablesDisponibles.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          );
        }

        return (
          <div className="flex items-center justify-center gap-2">
            <span className="font-medium">{valor || 'Sin asignar'}</span>
            <button
              onClick={() => setEditando(s => new Set(s).add(fila.id))}
              className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
              title="Editar responsable"
            >
              <FiEdit3 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
    {
      clave: 'modalidad',
      titulo: 'Modalidad',
      alineacion: 'centro' as const,
      ordenable: true,
      formatearCelda: (valor: 'Individual' | 'Grupal') => (
        <span className={`px-4 py-1.5 text-xs font-bold rounded-full ${
          valor === 'Individual'
            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        }`}>
          {valor}
        </span>
      ),
    },
  ];

  // === DATOS ===
  const datosProcesados = useMemo(() => {
    let datos = [...categorias];
    if (terminoBusqueda) {
      const term = terminoBusqueda.toLowerCase();
      datos = datos.filter(c =>
        c.area.toLowerCase().includes(term) ||
        c.nivel.toLowerCase().includes(term) ||
        c.modalidad.toLowerCase().includes(term) ||
        (c.responsable || '').toLowerCase().includes(term)
      );
    }
    return datos;
  }, [categorias, terminoBusqueda]);

  const datosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * registrosPorPagina;
    return datosProcesados.slice(inicio, inicio + registrosPorPagina);
  }, [datosProcesados, paginaActual]);

  const totalPaginas = Math.ceil(datosProcesados.length / registrosPorPagina);

  // === ACCIONES ===
  const handleGuardar = (id: number) => {
    setGuardado(s => new Set(s).add(id));
    setEditando(s => {
      const ns = new Set(s);
      ns.delete(id);
      return ns;
    });
  };

  const handleIniciarEliminacion = (id: number) => {
    setModalEliminar(id);
  };

  const confirmarEliminar = () => {
    if (modalEliminar) {
      setCategorias(prev => prev.filter(c => c.id !== modalEliminar));
      setModalEliminar(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Designar Responsables de Área y Nivel
        </h1>
        <nav className="text-sm text-gray-600 dark:text-gray-400">
          Inicio › <span className="text-gray-800 dark:text-white">Responsables</span>
        </nav>
      </div>

      {/* Búsqueda */}
      <div className="mb-6">
        <BarraBusquedaAreas
          terminoBusqueda={terminoBusqueda}
          onBuscarChange={setTerminoBusqueda}
        />
      </div>

      {/* Tabla */}
      <TablaBase
        datos={datosPaginados.map(fila => ({
          ...fila,
          __className: editando.has(fila.id)
            ? 'bg-red-50 dark:bg-red-900/20'
            : guardado.has(fila.id)
            ? 'bg-green-50 dark:bg-green-900/20'
            : ''
        }))}
        columnas={columnas}
        conOrdenamiento={true}
        onOrdenar={handleOrdenar}
        conAcciones={true}
        renderAcciones={(fila) => {
          const estaEditando = editando.has(fila.id);

          return (
            <div className="flex items-center justify-center gap-3">
              {/* Guardar */}
              {estaEditando && (
                <button
                  onClick={() => handleGuardar(fila.id)}
                  className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-all"
                  title="Guardar cambios"
                >
                  <FiSave className="w-4 h-4" />
                </button>
              )}

              {/* Basurero - SIEMPRE */}
              <button
                onClick={() => handleIniciarEliminacion(fila.id)}
                className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-all"
                title="Eliminar categoría"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          );
        }}
        className="mb-1"
      />

      {/* Paginación */}
      <Paginacion
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        totalRegistros={datosProcesados.length}
        registrosPorPagina={registrosPorPagina}
        onPaginaChange={setPaginaActual}
      />

      {/* Modal Eliminar */}
      <ConfirmarModal
        isOpen={!!modalEliminar}
        onClose={() => setModalEliminar(null)}
        onConfirm={confirmarEliminar}
        titulo="Eliminar categoría"
        mensaje={
          modalEliminar ? (
            (() => {
              const cat = categorias.find(c => c.id === modalEliminar);
              if (!cat) return "¿Estás seguro de eliminar esta categoría?";

              return (
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="font-medium text-gray-600">Área:</div>
                    <div className="text-gray-900">{cat.area}</div>

                    <div className="font-medium text-gray-600">Nivel:</div>
                    <div className="text-gray-900">{cat.nivel}</div>

                    <div className="font-medium text-gray-600">Responsable:</div>
                    <div className="text-gray-900">
                      {cat.responsable || <span className="text-gray-400 italic">Sin asignar</span>}
                    </div>

                    <div className="font-medium text-gray-600">Modalidad:</div>
                    <div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        cat.modalidad === 'Individual'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {cat.modalidad}
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 pt-3 border-t border-gray-200 text-center font-medium text-gray-800">
                    ¿Estás seguro de eliminar esta categoría?
                  </p>
                </div>
              );
            })()
          ) : (
            "¿Estás seguro de eliminar esta categoría?"
          )
        }
      />
    </div>
  );
};

export default Responsables;