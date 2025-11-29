import React, { useState } from 'react';
import TablaBase from '../components/tables/TablaBase';

interface Premiado {
    id: number;
    nombreCompleto: string;
    unidadEducativa: string;
    nota: number;
    area: string;
    nivel: string;
    fase: string;
    modalidad: string;
    __className?: string;
    posicionOriginal?: number;
}

const ConsultaDePremiados: React.FC = () => {
    // Filtros con valor inicial válido (evitamos string vacío)
    const [area, setArea] = useState('Matemáticas');
    const [nivel, setNivel] = useState('Primaria');
    const [fase, setFase] = useState('Primera Fase');
    const [modalidad, setModalidad] = useState('Individual');

    const [loading, setLoading] = useState(false);
    const [resultados, setResultados] = useState<Premiado[]>([]);
    const [busquedaRealizada, setBusquedaRealizada] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    // Datos reales para los selectores (control total)
    const areas = ['Matemáticas', 'Física', 'Química', 'Biología', 'Informática'];
    const niveles = ['Primaria', 'Secundaria'];
    const fases = ['Primera Fase', 'Segunda Fase'];
    const modalidades = ['Individual', 'Grupal'];

    const generarDatos = (cantidad: number): Premiado[] => {
        const nombres = ['Juan', 'María', 'Carlos', 'Ana', 'Pedro', 'Lucía', 'Roberto', 'Fernanda', 'Diego', 'Sofía'];
        const apellidos = ['Pérez', 'López', 'Ruiz', 'Gómez', 'Sola', 'Méndez', 'Flores', 'Vargas', 'Torres'];
        const colegios = ['San Agustín', 'La Salle', 'Don Bosco', 'Anglo Americano', 'San Ignacio', 'Calvert', 'Boliviano Alemán', 'Santa Ana'];
        const grupos = ['Los Pitágoras', 'Alpha Team', 'Calculistas', 'Los Newton', 'Quantum', 'Los Einsteins'];

        const datos: Premiado[] = [];
        for (let i = 0; i < cantidad; i++) {
            const esGrupal = modalidad === 'Grupal';
            const nombre = esGrupal
                ? grupos[Math.floor(Math.random() * grupos.length)] + ' ' + (i + 1)
                : `${nombres[Math.floor(Math.random() * nombres.length)]} ${apellidos[Math.floor(Math.random() * apellidos.length)]}`;

            datos.push({
                id: i + 1,
                nombreCompleto: nombre,
                unidadEducativa: colegios[Math.floor(Math.random() * colegios.length)],
                nota: Math.floor(Math.random() * (100 - 60 + 1)) + 60,
                area, nivel, fase, modalidad
            });
        }
        return datos;
    };

    const handleSearch = () => {
        setLoading(true);
        setBusquedaRealizada(true);
        setResultados([]);
        setSortConfig(null);

        setTimeout(() => {
            const datosGenerados = generarDatos(Math.floor(Math.random() * 10) + 5);

            // Ordenar por nota descendente para definir podio
            const ordenados = [...datosGenerados].sort((a, b) => b.nota - a.nota);

            // Aplicar colores FIJOS según posición original (nunca cambian al ordenar)
            const conPodio = ordenados.map((item, index) => {
                let className = '';

                if (index === 0) {
                    className = 'bg-yellow-100 border-l-4 border-yellow-500 dark:bg-yellow-900/40'; // Oro más fuerte
                } else if (index === 1) {
                    // Plata más visible
                    className = 'bg-slate-100 border-l-4 border-slate-400 dark:bg-slate-800/60';
                } else if (index === 2) {
                    className = 'bg-orange-100 border-l-4 border-orange-500 dark:bg-orange-900/30'; // Bronce
                }

                return {
                    ...item,
                    __className: className,
                    posicionOriginal: index + 1
                };
            });

            setResultados(conPodio);
            setLoading(false);
        }, 800);
    };

    const handleSort = (key: string, direction: 'asc' | 'desc') => {
        setSortConfig({ key, direction });

        const sorted = [...resultados].sort((a, b) => {
            const aValue = (a as any)[key];
            const bValue = (b as any)[key];

            if (aValue < bValue) return direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return direction === 'asc' ? 1 : -1;
            return 0;
        });

        // MANTENER COLORES DE PODIO: reasignamos __className según posicionOriginal
        const conColoresPreservados = sorted.map(item => {
            let className = '';
            if (item.posicionOriginal === 1) {
                className = 'bg-yellow-100 border-l-4 border-yellow-500 dark:bg-yellow-900/40';
            } else if (item.posicionOriginal === 2) {
                className = 'bg-slate-100 border-l-4 border-slate-400 dark:bg-slate-800/60';
            } else if (item.posicionOriginal === 3) {
                className = 'bg-orange-100 border-l-4 border-orange-500 dark:bg-orange-900/30';
            }
            return { ...item, __className: className };
        });

        setResultados(conColoresPreservados);
    };

    const columnas = [
        {
            clave: 'posicionOriginal',
            titulo: 'Pos.',
            alineacion: 'centro' as const,
            ancho: 'w-16',
            ordenable: true,
            formatearCelda: (valor: number) => (
                <span className="font-bold text-lg">
                    {valor === 1 && '1st place'}
                    {valor === 2 && '2nd place'}
                    {valor === 3 && '3rd place'}
                    {valor > 3 && valor}
                </span>
            )
        },
        { clave: 'nombreCompleto', titulo: 'Nombre', ordenable: true },
        { clave: 'unidadEducativa', titulo: 'Unidad Educativa', ordenable: true },
        {
            clave: 'nota',
            titulo: 'Nota Final',
            alineacion: 'centro' as const,
            ordenable: true,
            formatearCelda: (valor: number) => (
                <span className="font-bold text-blue-600 dark:text-blue-400">{valor}/100</span>
            )
        },
    ];

    const fieldBase = 'w-full px-4 py-3 rounded-lg border transition focus:outline-none focus:ring-2 ' +
        'bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-blue-500/30 focus:border-blue-300 ' +
        'dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:border-gray-600 dark:focus:border-blue-500';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <header className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
                        Consulta de Premiados
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Seleccione los criterios para ver la lista de ganadores
                    </p>
                </header>

                {/* Filtros */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-8 mb-8">
                    <div className="grid md:grid-cols-4 gap-6">
                        <div>
                            <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">Área</label>
                            <select value={area} onChange={(e) => setArea(e.target.value)} className={fieldBase}>
                                {areas.map(op => <option key={op} value={op}>{op}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">Nivel</label>
                            <select value={nivel} onChange={(e) => setNivel(e.target.value)} className={fieldBase}>
                                {niveles.map(op => <option key={op} value={op}>{op}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">Fase</label>
                            <select value={fase} onChange={(e) => setFase(e.target.value)} className={fieldBase}>
                                {fases.map(op => <option key={op} value={op}>{op}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">Modalidad</label>
                            <select value={modalidad} onChange={(e) => setModalidad(e.target.value)} className={fieldBase}>
                                {modalidades.map(op => <option key={op} value={op}>{op}</option>)}
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className={`mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-all transform hover:scale-[1.01] shadow-lg flex justify-center items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Buscando...' : 'Buscar Premiados'}
                    </button>
                </div>

                {busquedaRealizada && !loading && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                Resultados encontrados: {resultados.length}
                            </h2>
                            {resultados.length > 0 && (
                                <span className="px-4 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
                                    {sortConfig
                                        ? `Ordenado por ${columnas.find(c => c.clave === sortConfig.key)?.titulo}`
                                        : 'Ordenado por mejor puntuación'}
                                </span>
                            )}
                        </div>

                        {resultados.length > 0 ? (
                            <TablaBase
                                datos={resultados}
                                columnas={columnas}
                                className="shadow-xl rounded-xl overflow-hidden"
                                conOrdenamiento={true}
                                onOrdenar={handleSort}
                            />
                        ) : (
                            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                                <p className="text-gray-500 dark:text-gray-400 text-lg">
                                    No se encontraron resultados para los criterios seleccionados.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConsultaDePremiados;