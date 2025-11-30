// src/pages/AprobacionCalificaciones.tsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import BarraBusquedaAreas from "../components/tables/BarraBusqueda";
import TablaBase from "../components/tables/TablaBase";
import Paginacion from "../components/ui/Paginacion";

interface CalificacionItem {
  id: number;
  iniciales: string;
  nombre: string;
  codigo: string;
  estado: "Clasificado" | "No clasificado";
  nota: number;
  observacion: string;
}

const AprobacionCalificaciones: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [calificaciones] = useState<CalificacionItem[]>([
    { id: 1, iniciales: "JD", nombre: "Juan Daniel Álvarez", codigo: "100", estado: "Clasificado", nota: 78, observacion: "Resolvió la mayoría de los problemas, errores menores al final." },
    { id: 2, iniciales: "MR", nombre: "María Rojas López", codigo: "107", estado: "Clasificado", nota: 51, observacion: "Desempeño irregular con aciertos clave, revisar fundamentos." },
    { id: 3, iniciales: "LG", nombre: "Luis Gamboa Torres", codigo: "120", estado: "No clasificado", nota: 30, observacion: "Varias respuestas incompletas y errores conceptuales." },
    { id: 4, iniciales: "AP", nombre: "Ana Pérez Vargas", codigo: "56", estado: "Clasificado", nota: 70, observacion: "Faltas puntuales en dos ejercicios, método correcto." },
    { id: 5, iniciales: "JM", nombre: "Jorge Méndez Arce", codigo: "94", estado: "Clasificado", nota: 80, observacion: "Soluciones correctas y bien justificadas." },
    { id: 6, iniciales: "CQ", nombre: "Carla Quispe Condori", codigo: "78", estado: "No clasificado", nota: 45, observacion: "Omisiones y validación/formato insuficientes." },
    { id: 7, iniciales: "SR", nombre: "Soledad Ramos Guzmán", codigo: "81", estado: "Clasificado", nota: 60, observacion: "Mejorar tiempos de respuesta y justificación." },
  ]);

  // Estados para modales
  const [modalRechazar, setModalRechazar] = useState(false);
  const [modalAprobar, setModalAprobar] = useState(false);
  const [justificacion, setJustificacion] = useState("");

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return calificaciones;
    const term = searchTerm.toLowerCase();
    return calificaciones.filter(item =>
      item.nombre.toLowerCase().includes(term) ||
      item.codigo.includes(term) ||
      item.observacion.toLowerCase().includes(term)
    );
  }, [calificaciones, searchTerm]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  // FUNCIÓN ÚNICA: vuelve a la lista de listas
  const volverAListaDeListas = () => {
    navigate("/aprobacion-calificaciones");
  };

  const columns = [
    {
      clave: 'nombre',
      titulo: 'Nombre Completo',
      alineacion: 'izquierda' as const,
      formatearCelda: (_valor: any, fila: CalificacionItem) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center text-white font-bold text-xs">
            {fila.iniciales}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{fila.nombre}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">CI: 7{fila.codigo.padStart(7, '0')}</p>
          </div>
        </div>
      ),
    },
    { clave: 'codigo', titulo: 'Código', alineacion: 'centro' as const },
    {
      clave: 'estado',
      titulo: 'Estado',
      alineacion: 'centro' as const,
      formatearCelda: (valor: string) => (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
          valor === "Clasificado"
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
        }`}>
          {valor}
        </span>
      ),
    },
    {
      clave: 'nota',
      titulo: 'Nota',
      alineacion: 'centro' as const,
      formatearCelda: (valor: number) => (
        <div className="inline-flex items-center justify-center w-16 px-3 py-1 text-sm font-bold text-gray-800 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-200">
          {valor}
        </div>
      ),
    },
    {
      clave: 'observacion',
      titulo: 'Observación',
      alineacion: 'izquierda' as const,
      formatearCelda: (valor: string) => (
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">{valor}</p>
      ),
    },
  ];

  return (
    <>
      <PageMeta 
        title="Aprobación de Calificaciones | OH-SANSI"
        description="Revisión y aprobación de calificaciones enviadas por evaluadores"
      />
      <PageBreadcrumb pageTitle="Detalle de Calificaciones" />

      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 text-sm">
            <div><span className="font-medium">Área:</span> Matemáticas</div>
            <div><span className="font-medium">Nivel:</span> Primaria</div>
            <div><span className="font-medium">Modalidad:</span> Individual</div>
            <div><span className="font-medium">Evaluador:</span> Juan Vera Cruz</div>
            <div><span className="font-medium">Fase:</span> Clasificación</div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <BarraBusquedaAreas
              terminoBusqueda={searchTerm}
              onBuscarChange={(t) => {
                setSearchTerm(t);
                setCurrentPage(1);
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setModalRechazar(true)}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-full hover:bg-red-700 transition-all shadow-sm"
              >
                Rechazar lista
              </button>
              <button
                onClick={() => setModalAprobar(true)}
                className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-full hover:bg-green-700 transition-all shadow-sm"
              >
                Aprobar listas
              </button>
            </div>
          </div>

          <TablaBase
            datos={paginatedData}
            columnas={columns}
            conOrdenamiento={false}
            conAcciones={false}
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

      {/* MODAL DE RECHAZO CON JUSTIFICACIÓN */}
      {modalRechazar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-gray-900/70 dark:bg-black/70" 
            onClick={() => {
              setModalRechazar(false);
              setJustificacion("");
            }}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Justifique por qué rechaza la lista
            </h3>
            <textarea
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              placeholder="Ingrese su justificación"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              rows={5}
              autoFocus
            />
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => {
                  setModalRechazar(false);
                  setJustificacion("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (justificacion.trim() === "") {
                    alert("Por favor, ingrese una justificación para rechazar la lista.");
                    return;
                  }
                  alert(`Lista rechazada exitosamente.\nJustificación: "${justificacion}"`);
                  setModalRechazar(false);
                  setJustificacion("");
                  volverAListaDeListas(); // ← REDIRECCIÓN AQUÍ
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE APROBAR */}
      {modalAprobar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-gray-900/70 dark:bg-black/70" 
            onClick={() => setModalAprobar(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              ¿Seguro que la lista es CORRECTA?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Una vez apruebe esta lista se publicará los resultados en la página.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalAprobar(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  alert("Lista aprobada exitosamente");
                  setModalAprobar(false);
                  volverAListaDeListas(); // ← REDIRECCIÓN AQUÍ
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AprobacionCalificaciones;