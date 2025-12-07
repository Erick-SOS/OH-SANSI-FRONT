// src/pages/ListaDeClasificados.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TablaBase from '../components/tables/TablaBase';

interface Clasificado {
    id: number;
    nombreCompleto: string;
    unidadEducativa: string;
    nota: number | null;
    estado: 'CLASIFICADO' | 'NO_CLASIFICADO' | 'DESCALIFICADO';
}

const ListaDeClasificados: React.FC = () => {
    const navigate = useNavigate();

    const [area, setArea] = useState('Matemáticas');
    const [nivel, setNivel] = useState('Primaria');
    const [loading, setLoading] = useState(false);
    const [resultados, setResultados] = useState<Clasificado[]>([]);
    const [busquedaRealizada, setBusquedaRealizada] = useState(false);

    const areas = ['Matemáticas', 'Física', 'Química', 'Biología', 'Informática', 'Literatura', 'Historia'];
    const niveles = ['Primaria', 'Secundaria', 'Preuniversitario'];

    const generarDatos = (): Clasificado[] => {
        const nombres = ['Juan', 'María', 'Carlos', 'Ana', 'Pedro', 'Lucía', 'Roberto', 'Fernanda', 'Diego', 'Sofía', 'Mateo', 'Valentina'];
        const apellidos = ['Pérez', 'López', 'Ruiz', 'Gómez', 'Sola', 'Méndez', 'Flores', 'Vargas', 'Torres', 'Rojas', 'Castro', 'Ortiz'];
        const colegios = ['San Agustín', 'La Salle', 'Don Bosco', 'Anglo Americano', 'San Ignacio', 'Calvert', 'Boliviano Alemán', 'Adela Zamudio'];
        const grupos = ['Los Genios', 'Alpha Team', 'Los Olímpicos', 'Quantum', 'Los Einsteins', 'Pitágoras Jr.'];

        const datos: Clasificado[] = [];
        for (let i = 0; i < 22; i++) {
            const esGrupal = Math.random() > 0.65;
            const esDescalificado = Math.random() > 0.9;
            const notaBase = esDescalificado ? 0 : Math.floor(Math.random() * 51) + 50;
            const nota = notaBase >= 90 ? notaBase : notaBase;

            const estado: Clasificado['estado'] = esDescalificado
                ? 'DESCALIFICADO'
                : nota >= 90 ? 'CLASIFICADO' : 'NO_CLASIFICADO';

            datos.push({
                id: i + 1,
                nombreCompleto: esGrupal
                    ? `${grupos[Math.floor(Math.random() * grupos.length)]} ${i + 1}`
                    : `${nombres[Math.floor(Math.random() * nombres.length)]} ${apellidos[Math.floor(Math.random() * apellidos.length)]}`,
                unidadEducativa: esGrupal ? 'Equipo grupal' : colegios[Math.floor(Math.random() * colegios.length)],
                nota: esDescalificado ? null : nota,
                estado,
            });
        }
        return datos.sort((a, b) => (b.nota || 0) - (a.nota || 0));
    };

    const handleSearch = () => {
        setLoading(true);
        setBusquedaRealizada(true);
        setResultados([]);

        setTimeout(() => {
            setResultados(generarDatos());
            setLoading(false);
        }, 900);
    };

    const columnas = [
        {
            clave: 'nombreCompleto',
            titulo: 'Nombre Completo',
            formatearCelda: (valor: string, fila: Clasificado) => (
                <span className={`font-semibold ${fila.estado === 'CLASIFICADO' ? 'text-green-700 dark:text-green-400' : fila.estado === 'DESCALIFICADO' ? 'text-red-700 dark:text-red-400' : ''}`}>
                    {valor}
                </span>
            ),
        },
        { clave: 'unidadEducativa', titulo: 'Unidad Educativa' },
        {
            clave: 'nota',
            titulo: 'Nota Final',
            alineacion: 'centro' as const,
            formatearCelda: (valor: number | null, fila: Clasificado) => {
                if (fila.estado === 'DESCALIFICADO') {
                    return <span className="text-red-600 dark:text-red-400 font-bold text-lg">DESCALIFICADO</span>;
                }
                if (valor === null) return <span className="text-gray-500">—</span>;
                const esClasificado = valor >= 90;
                return (
                    <span className={`inline-block px-5 py-2.5 rounded-full font-bold text-lg shadow-md ${esClasificado
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300 shadow-green-500/30'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                        {valor}/100
                    </span>
                );
            },
        },
        // COLUMNA "Modalidad" ELIMINADA
    ];

    const fieldBase = 'w-full px-4 py-3 rounded-lg border transition focus:outline-none focus:ring-2 bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-blue-500/30 focus:border-blue-300 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:border-gray-600 dark:focus:border-blue-500';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
            <div className="max-w-5xl mx-auto">
                {/* BOTÓN VOLVER */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Volver
                    </button>
                </div>

                {/* Título */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
                        Lista de Clasificados
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Resultados oficiales de la fase clasificatoria
                    </p>

                    <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm font-medium">
                        <span className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded-full"></div> Clasificado (≥90)
                        </span>
                        <span className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-400 rounded-full"></div> No clasificado
                        </span>
                        <span className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-500 rounded-full"></div> Descalificado
                        </span>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-8 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
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
                    </div>

                    <div className="mt-10 text-center">
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className={`w-full max-w-md mx-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Cargando...' : 'Ver Resultados Oficiales'}
                        </button>
                    </div>
                </div>

                {/* Resultados */}
                {busquedaRealizada && !loading && (
                    <div className="animate-fade-in">
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                                Total de participantes: {resultados.length}
                            </h2>
                        </div>

                        {resultados.length > 0 ? (
                            <TablaBase
                                datos={resultados}
                                columnas={columnas}
                                className="shadow-2xl rounded-2xl overflow-hidden"
                                conOrdenamiento={false}
                                claseFila={(fila: Clasificado) =>
                                    fila.estado === 'CLASIFICADO'
                                        ? 'bg-green-50/70 dark:bg-green-900/20 border-l-4 border-green-500'
                                        : fila.estado === 'DESCALIFICADO'
                                        ? 'bg-red-50/70 dark:bg-red-900/20 border-l-4 border-red-500 opacity-80'
                                        : ''
                                }
                            />
                        ) : (
                            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border">
                                <p className="text-xl text-gray-500 dark:text-gray-400">
                                    No hay resultados para esta categoría aún.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListaDeClasificados;