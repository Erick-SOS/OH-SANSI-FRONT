import React, { useState, useMemo } from 'react';
import PageBreadcrumb from "../../components/common/RutaNavegacionPagina";
import PageMeta from "../../components/common/PaginaMeta";
import BarraBusquedaOlimpias from "../../components/tables/BarraBusquedaOlimpias";
import TablaBase from "../../components/tables/TablaBase";
import Paginacion from "../../components/ui/Paginacion";
import ModalConfirmacion from "../../components/ui/modal/ModalConfirmacion";
import jsPDF from 'jspdf';
import { MdDownload, MdFileDownload } from 'react-icons/md';

interface OlimpiaItem {
  id: number;
  nombre: string;
  ci: string;
  areaCompetencia: string;
  nivel: string;
  modalidad: string;
  estado: string;
  nota: number;
  distincion: string;
}

const OlimpistasPremiados: React.FC = () => {
  const [olimpias] = useState<OlimpiaItem[]>([
    { id: 1, nombre: "Juan Daniel Álvarez", ci: "7229843", areaCompetencia: "Matemáticas", nivel: "Primaria", modalidad: "Individual", estado: "Clasificado", nota: 78, distincion: "Medalla de Plata" },
    { id: 2, nombre: "María Rosa López", ci: "7658213", areaCompetencia: "Matemáticas", nivel: "Secundaria", modalidad: "Individual", estado: "Clasificado", nota: 90, distincion: "Medalla de Oro" },
    { id: 3, nombre: "Luis Gómez Pérez", ci: "8219775", areaCompetencia: "Biología", nivel: "Primaria", modalidad: "Individual", estado: "Clasificado", nota: 65, distincion: "Medalla de Bronce" },
    { id: 4, nombre: "Ana Pérez Vargas", ci: "7994450", areaCompetencia: "Matemáticas", nivel: "Primaria", modalidad: "Individual", estado: "Clasificado", nota: 92, distincion: "Medalla de Oro" },
    { id: 5, nombre: "Jorge Méndez Arce", ci: "9035174", areaCompetencia: "Biología", nivel: "Primaria", modalidad: "Individual", estado: "Clasificado", nota: 78, distincion: "Medalla de Plata" },
    { id: 6, nombre: "Carmen Quintero", ci: "7842156", areaCompetencia: "Matemáticas", nivel: "Secundaria", modalidad: "Individual", estado: "Clasificado", nota: 69, distincion: "Medalla de Bronce" },
    { id: 7, nombre: "Roberto Elías", ci: "7710539", areaCompetencia: "Informática", nivel: "Secundaria", modalidad: "Individual", estado: "Clasificado", nota: 82, distincion: "Medalla de Plata" },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 7;

  const [ordenarPor, setOrdenarPor] = useState<keyof OlimpiaItem | null>(null);
  const [direccionOrden, setDireccionOrden] = useState<'asc' | 'desc'>('asc');

  const [modalExportarLista, setModalExportarLista] = useState(false);
  const [modalDescargarTodos, setModalDescargarTodos] = useState(false);
  const [modalCertificadoIndividual, setModalCertificadoIndividual] = useState<number | null>(null);

  // === GENERACIÓN DE PDF (CORREGIDO) ===
  const generarCertificado = (item: OlimpiaItem) => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const pageWidth = 297;
    const pageHeight = 210;

    // Fondo claro
    doc.setFillColor(245, 250, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Título
    doc.setFont("helvetica", "bold");
    doc.setFontSize(32);
    doc.setTextColor(30, 64, 175);
    doc.text("CERTIFICADO DE PREMIO", pageWidth / 2, 50, { align: "center" });

    // Nombre
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(item.nombre.toUpperCase(), pageWidth / 2, 80, { align: "center" });

    // Distinción con color
    const color = item.distincion.includes("Oro")
      ? [255, 215, 0]    // Oro
      : item.distincion.includes("Plata")
        ? [192, 192, 192] // Plata
        : [205, 127, 50]; // Bronce

    doc.setFontSize(20);
    doc.setTextColor(color[0], color[1], color[2]); // CORREGIDO
    doc.text(`GANADOR: ${item.distincion}`, pageWidth / 2, 105, { align: "center" });

    // Detalles
    doc.setFontSize(16);
    doc.setTextColor(80, 80, 80);
    doc.text(`${item.areaCompetencia} - ${item.nivel}`, pageWidth / 2, 125, { align: "center" });
    doc.text(`Modalidad: ${item.modalidad}`, pageWidth / 2, 140, { align: "center" });

    // Fecha
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, 165, { align: "center" });

    // Firma
    doc.setFontSize(12);
    doc.text("________________________", pageWidth / 2 - 40, 190);
    doc.text("Director de Olimpiadas", pageWidth / 2 - 40, 195);

    return doc;
  };

  const handleDownloadCertificado = (id: number) => {
    const item = olimpias.find(i => i.id === id);
    if (!item) return;
    const doc = generarCertificado(item);
    doc.save(`certificado-${item.nombre.replace(/ /g, '-')}.pdf`);
    setModalCertificadoIndividual(null);
  };

  const handleExportarLista = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.setFontSize(16);
    doc.text("Lista de Premiados", 14, 20);
    doc.setFontSize(12);
    let y = 30;
    sortedData.forEach((item, i) => {
      doc.text(`${i + 1}. ${item.nombre} - ${item.distincion} (${item.nota} pts)`, 14, y);
      y += 8;
    });
    doc.save("lista-premiados.pdf");
    setModalExportarLista(false);
  };

  const handleDescargarTodos = () => {
    olimpias.forEach(item => {
      const doc = generarCertificado(item);
      doc.save(`certificado-${item.nombre.replace(/ /g, '-')}.pdf`);
    });
    setModalDescargarTodos(false);
  };

  // === ORDENAMIENTO ===
  const handleOrdenar = (columna: string, direccion: 'asc' | 'desc') => {
    setOrdenarPor(columna as keyof OlimpiaItem);
    setDireccionOrden(direccion);
  };

  // === FILTRADO Y PAGINACIÓN ===
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return olimpias;
    const term = searchTerm.toLowerCase();
    return olimpias.filter(item =>
      item.nombre.toLowerCase().includes(term) ||
      item.ci.includes(term) ||
      item.areaCompetencia.toLowerCase().includes(term) ||
      item.nivel.toLowerCase().includes(term) ||
      item.modalidad.toLowerCase().includes(term)
    );
  }, [olimpias, searchTerm]);

  const sortedData = useMemo(() => {
    if (!ordenarPor) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valA = a[ordenarPor];
      const valB = b[ordenarPor];
      if (typeof valA === 'string' && typeof valB === 'string') {
        return direccionOrden === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return direccionOrden === 'asc' ? valA - valB : valB - valA;
      }
      return 0;
    });
  }, [filteredData, ordenarPor, direccionOrden]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage]);

  const columns = [
    {
      clave: 'nombre',
      titulo: 'Nombre Completo',
      alineacion: 'izquierda' as const,
      formatearCelda: (_valor: string, fila: OlimpiaItem) => {
        const iniciales = fila.nombre.split(' ').filter(n => n).map(n => n[0]).slice(0, 2).join('').toUpperCase();
        return (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {iniciales}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{fila.nombre}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">CI: {fila.ci}</p>
            </div>
          </div>
        );
      }
    },
    { clave: 'areaCompetencia', titulo: 'Área', alineacion: 'izquierda' as const, ordenable: true },
    { clave: 'nivel', titulo: 'Nivel', alineacion: 'izquierda' as const, ordenable: true },
    { clave: 'modalidad', titulo: 'Modalidad', alineacion: 'izquierda' as const, ordenable: true },
    { clave: 'estado', titulo: 'Estado', alineacion: 'izquierda' as const, ordenable: true },
    {
      clave: 'nota',
      titulo: 'Nota',
      alineacion: 'centro' as const,
      ordenable: true,
      formatearCelda: (valor: number) => (
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{valor}</span>
      )
    },
    {
      clave: 'distincion',
      titulo: 'Distinción',
      alineacion: 'izquierda' as const,
      ordenable: true,
      formatearCelda: (valor: string) => (
        <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
          valor.includes("Oro") ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
          valor.includes("Plata") ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200" :
          "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
        }`}>
          {valor}
        </span>
      )
    },
    {
      clave: 'acciones',
      titulo: 'Certificado',
      alineacion: 'centro' as const,
      formatearCelda: (_: unknown, fila: OlimpiaItem) => (
        <button
          onClick={() => setModalCertificadoIndividual(fila.id)}
          className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 p-1"
          title="Descargar certificado"
        >
          <MdDownload size={20} />
        </button>
      )
    },
  ];

  return (
    <>
      <PageMeta title="Olimpistas Premiados | TailAdmin" description="Gestión de premiación y certificados" />
      <PageBreadcrumb pageTitle="Olimpistas Premiados" />

      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex-1 max-w-md">
              <BarraBusquedaOlimpias
                terminoBusqueda={searchTerm}
                onBuscarChange={(t) => {
                  setSearchTerm(t);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setModalExportarLista(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#465FFF] rounded-full hover:bg-[#3a4fe6] transition-all"
              >
                <MdFileDownload size={18} />
                Exportar lista
              </button>

              <button
                onClick={() => setModalDescargarTodos(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#465FFF] rounded-full hover:bg-[#3a4fe6] transition-all"
              >
                <MdDownload size={18} />
                Descargar certificados
              </button>
            </div>
          </div>

          {searchTerm && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {filteredData.length} resultados para "{searchTerm}"
            </p>
          )}

          <TablaBase
            datos={paginatedData.map((item, index) => ({
              ...item,
              numero: (currentPage - 1) * itemsPerPage + index + 1
            }))}
            columnas={columns}
            conOrdenamiento={true}
            onOrdenar={handleOrdenar}
            conAcciones={false}
            className="w-full"
          />

          <Paginacion
            paginaActual={currentPage}
            totalPaginas={Math.ceil(filteredData.length / itemsPerPage)}
            totalRegistros={filteredData.length}
            registrosPorPagina={itemsPerPage}
            onPaginaChange={setCurrentPage}
          />
        </div>
      </div>

      {}
      <ModalConfirmacion
        isOpen={modalExportarLista}
        titulo="Exportar lista de premiados"
        mensaje="La lista fue exportada exitosamente."
        onConfirmar={handleExportarLista}
        onCancelar={() => setModalExportarLista(false)}
      />

      <ModalConfirmacion
        isOpen={modalDescargarTodos}
        titulo="Descargar todos los certificados"
        mensaje="Se descargarán todos los certificados en formato PDF."
        onConfirmar={handleDescargarTodos}
        onCancelar={() => setModalDescargarTodos(false)}
      />

      <ModalConfirmacion
        isOpen={modalCertificadoIndividual !== null}
        titulo="Descargar certificado"
        mensaje="Se descargará el certificado en formato PDF."
        onConfirmar={() => modalCertificadoIndividual && handleDownloadCertificado(modalCertificadoIndividual)}
        onCancelar={() => setModalCertificadoIndividual(null)}
      />
    </>
  );
};

export default OlimpistasPremiados;