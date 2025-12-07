// src/pages/ConsultaDePremiados.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TablaBase from '../components/tables/TablaBase';

interface Premiado {
    id: number;
    nombreCompleto: string;
    unidadEducativa: string;
    nota: number;
    area: string;
    nivel: string;
    posicionOriginal?: number;
}

const ConsultaDePremiados: React.FC = () => {
    const navigate = useNavigate();

    const [area, setArea] = useState('Matemáticas');
    const [nivel, setNivel] = useState('Primaria');
    const [loading, setLoading] = useState(false);
    const [resultados, setResultados] = useState<Premiado[]>([]);
    const [busquedaRealizada, setBusquedaRealizada] = useState(false);

    const areas = ['Matemáticas', 'Física', 'Química', 'Biología', 'Informática'];
    const niveles = ['Primaria', 'Secundaria'];

    const generarDatos = (cantidad: number): Premiado[] => {
        const nombres = ['Juan', 'María', 'Carlos', 'Ana', 'Pedro', 'Lucía', 'Roberto', 'Fernanda', 'Diego', 'Sofía'];
        const apellidos = ['Pérez', 'López', 'Ruiz', 'Gómez', 'Sola', 'Méndez', 'Flores', 'Vargas', 'Torres'];
        const colegios = ['San Agustín', 'La Salle', 'Don Bosco', 'Anglo Americano', 'San Ignacio', 'Calvert', 'Boliviano Alemán', 'Santa Ana'];
        const grupos = ['Los Pitágoras', 'Alpha Team', 'Calculistas', 'Los Newton', 'Quantum', 'Los Einsteins'];

        const datos: Premiado[] = [];
        for (let i = 0; i < cantidad; i++) {
            const esGrupal = Math.random() > 0.7;
            const nombre = esGrupal
                ? grupos[Math.floor(Math.random() * grupos.length)] + ' ' + (i + 1)
                : `${nombres[Math.floor(Math.random() * nombres.length)]} ${apellidos[Math.floor(Math.random() * apellidos.length)]}`;

            datos.push({
                id: i + 1,
                nombreCompleto: nombre,
                unidadEducativa: colegios[Math.floor(Math.random() * colegios.length)],
                nota: Math.floor(Math.random() * (100 - 60 + 1)) + 60,
                area,
                nivel
            });
        }
        return datos;
    };

    const handleSearch = () => {
        setLoading(true);
        setBusquedaRealizada(true);
        setResultados([]);

        setTimeout(() => {
            const datosGenerados = generarDatos(Math.floor(Math.random() * 8) + 5);
            const ordenados = [...datosGenerados].sort((a, b) => b.nota - a.nota);

            const conPodio = ordenados.map((item, index) => ({
                ...item,
                posicionOriginal: index + 1
            }));

            setResultados(conPodio);
            setLoading(false);
        }, 800);
    };

    const columnas = [
        { clave: 'nombreCompleto', titulo: 'Ganador', ordenable: false },
        { clave: 'unidadEducativa', titulo: 'Unidad Educativa', ordenable: false },
        {
            clave: 'nota',
            titulo: 'Nota Final',
            alineacion: 'centro' as const,
            ordenable: false,
            formatearCelda: (valor: number) => (
                <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">{valor}/100</span>
            )
        },
    ];

    const fieldBase = 'w-full px-4 py-3 rounded-lg border transition focus:outline-none focus:ring-2 ' +
        'bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-blue-500/30 focus:border-blue-300 ' +
        'dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:border-gray-600 dark:focus:border-blue-500';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <header className="mb-10">
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

                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
                            Lista de Premiados
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Ganadores por área y nivel
                        </p>
                        <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm font-medium">
                        <span className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div> Oro
                        </span>
                        <span className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-slate-500 rounded-full"></div> Plata
                        </span>
                        <span className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-orange-500 rounded-full"></div> Bronce
                        </span>
                    </div>
                    </div>
                </header>

                {/* Filtros SOLO Área y Nivel */}
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
                            {loading ? 'Buscando...' : 'Ver Resultados Finales'}
                        </button>
                    </div>
                </div>

                {busquedaRealizada && !loading && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                                Ganadores encontrados: {resultados.length}
                            </h2>
                        </div>

                        {resultados.length > 0 ? (
                            <TablaBase
                                datos={resultados}
                                columnas={columnas}
                                className="shadow-2xl rounded-2xl overflow-hidden"
                                conOrdenamiento={false}
                                claseFila={(fila: Premiado) => {
                                    if (fila.posicionOriginal === 1) return 'bg-yellow-100 dark:bg-yellow-900/40 border-l-8 border-yellow-500 shadow-lg';
                                    if (fila.posicionOriginal === 2) return 'bg-slate-100 dark:bg-slate-800/60 border-l-8 border-slate-400 shadow-lg';
                                    if (fila.posicionOriginal === 3) return 'bg-orange-100 dark:bg-orange-900/40 border-l-8 border-orange-500 shadow-lg';
                                    return 'hover:bg-gray-50 dark:hover:bg-gray-800';
                                }}
                            />
                        ) : (
                            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                                    No se encontraron ganadores para esta área y nivel.
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