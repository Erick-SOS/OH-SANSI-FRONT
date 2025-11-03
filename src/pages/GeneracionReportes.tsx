// src/pages/GeneracionReportes.tsx
import React, { useState, useMemo } from 'react';
import Paginacion from '../components/ui/Paginacion';

// Tipos de reporte
const tiposReporte = [
  { value: 'historial', label: 'Historial de Cambios' },
  { value: 'inscritos', label: 'Inscritos por Área' },
  { value: 'resultados', label: 'Resultados Clasificación' },
  { value: 'premiacion', label: 'Premiación Final' },
] as const;

// Columnas por tipo
const columnas = {
  historial: ['N°', 'Nombre', 'Fecha y Hora', 'Olimpiada/Grupo Afectado', 'Nota Anterior', 'Nueva Nota'],
  inscritos: ['N°', 'Estudiante', 'Área', 'Institución', 'Fecha Inscripción'],
  resultados: ['N°', 'Estudiante', 'Puntaje', 'Posición', 'Área'],
  premiacion: ['N°', 'Estudiante', 'Premio', 'Área', 'Institución'],
} as const;

// Datos de ejemplo (20 filas)
const datosEjemplo = {
  historial: Array.from({ length: 20 }, (_, i) => ({
    nombre: `Umad Wilson ${i + 1}`,
    fecha: `20/03/2025 - 18:0${i % 5} hrs`,
    grupo: 'Abraham Espinoza',
    notaAnt: 20 - (i % 5),
    notaNueva: 20,
  })),
  inscritos: Array.from({ length: 20 }, (_, i) => ({
    estudiante: `Estudiante ${i + 1}`,
    area: ['Matemáticas', 'Física', 'Química'][i % 3],
    institucion: 'Colegio Nacional',
    fecha: '01/03/2025',
  })),
  resultados: Array.from({ length: 20 }, (_, i) => ({
    estudiante: `Estudiante ${i + 1}`,
    puntaje: 95 - i,
    posicion: i + 1,
    area: 'Física',
  })),
  premiacion: Array.from({ length: 20 }, (_, i) => ({
    estudiante: `Ganador ${i + 1}`,
    premio: ['Oro', 'Plata', 'Bronce'][i % 3],
    area: 'Química',
    institucion: 'IEP San José',
  })),
} as const;

type ReporteKey = keyof typeof datosEjemplo;

const GeneracionReportes: React.FC = () => {
  const [tipo, setTipo] = useState<ReporteKey>('historial');
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const porPagina = 7;

  const datos = datosEjemplo[tipo];
  const cols = columnas[tipo];

  const filtrados = useMemo(() => {
    return datos.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(busqueda.toLowerCase())
      )
    );
  }, [datos, busqueda]);

  const paginados = filtrados.slice((pagina - 1) * porPagina, pagina * porPagina);
  const totalPaginas = Math.ceil(filtrados.length / porPagina);

  // Exportar como CSV
  const exportarCSV = () => {
    const header = cols.join(',') + '\n';
    const rows = paginados.map((row, i) =>
      [(pagina - 1) * porPagina + i + 1, ...Object.values(row)].join(',')
    ).join('\n');
    const csv = '\uFEFF' + header + rows;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tipo}_reporte.csv`;
    link.click();
  };

  // Exportar como PDF (imprime)
  const exportarPDF = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    const filas = paginados
      .map((row, i) => {
        const valores = [(pagina - 1) * porPagina + i + 1, ...Object.values(row)];
        return `<tr>${valores.map(v => `<td style="padding:8px;border:1px solid #ddd;">${v}</td>`).join('')}</tr>`;
      })
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Reporte ${tipo}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Reporte: ${tiposReporte.find(t => t.value === tipo)?.label}</h1>
          <table>
            <thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead>
            <tbody>${filas}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Generación de reportes</h1>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4 justify-center">
          <span className="text-sm font-medium text-gray-700">Tipo de reporte</span>
          <select
            value={tipo}
            onChange={(e) => { setTipo(e.target.value as ReporteKey); setPagina(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {tiposReporte.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
            Generar reporte
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="relative">
            <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={exportarPDF} className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar como PDF
            </button>
            <button onClick={exportarCSV} className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar como XLSX
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {cols.map((col) => (
                  <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginados.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {(pagina - 1) * porPagina + index + 1}
                  </td>
                  {Object.values(row).map((val, i) => (
                    <td key={i} className="px-6 py-4 text-sm text-gray-900">
                      {String(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
          <p className="text-sm text-gray-600">
            Mostrando {(pagina - 1) * porPagina + 1} de {Math.min(pagina * porPagina, filtrados.length)} de {filtrados.length}
          </p>
          <Paginacion
            paginaActual={pagina}
            totalPaginas={totalPaginas}
            totalRegistros={filtrados.length}
            registrosPorPagina={porPagina}
            onPaginaChange={setPagina}
          />
        </div>
      </div>
    </div>
  );
};

export default GeneracionReportes;