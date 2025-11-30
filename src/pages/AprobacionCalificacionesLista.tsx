// src/pages/AprobacionCalificacionesLista.tsx
// src/pages/AprobacionCalificacionesLista.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";

const listasPendientes = [
  { id: 1, area: "Matemáticas", nivel: "Primaria", modalidad: "Individual", fase: "Clasificación", evaluador: "Juan Vera Cruz", fecha: "18/08/2025" },
  { id: 2, area: "Matemáticas", nivel: "Secundaria", modalidad: "Individual", fase: "Clasificación", evaluador: "María Gonzales", fecha: "18/08/2025" },
  { id: 3, area: "Matemáticas", nivel: "Preuniversitario", modalidad: "Individual", fase: "Clasificación", evaluador: "Luis Mendoza", fecha: "17/08/2025" },
];

const AprobacionCalificacionesLista: React.FC = () => {
  const navigate = useNavigate();

  const handleGenerarLista = () => {
    alert("Generando lista de clasificados...\n\nPDF descargado: Lista_Clasificados_Matematicas_2025.pdf");
  };

  return (
    <>
      <PageMeta 
        title="Aprobación de Calificaciones | OH-SANSI"
        description="Listado de listas de calificaciones pendientes de aprobación por el administrador"
      />
      <PageBreadcrumb pageTitle="Aprobación de Calificaciones" />

      <div className="space-y-8">
        {/* SECCIÓN SUPERIOR: TÍTULO + FASE + BOTÓN GENERAR */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Calificaciones del área: <span className="text-blue-600">Matemáticas</span>
              </h1>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">Fase de la olimpiada</span>
                <div className="flex items-center gap-3">
                  <span className="px-5 py-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-semibold">
                    Fase de Clasificación
                  </span>
                  <span className="px-5 py-2 bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 rounded-full text-sm font-medium">
                    Fase de Final
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerarLista}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
            >
              Generar lista de clasificados
            </button>
          </div>

          <hr className="border-gray-200 dark:border-gray-700 mb-8" />

          {/* LISTA DE PENDIENTES */}
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Listas de calificaciones pendientes de aprobación
          </h2>

          <div className="grid gap-5">
            {listasPendientes.map((lista) => (
              <div
                key={lista.id}
                onClick={() => navigate(`/aprobacion-calificaciones/${lista.id}`)}
                className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-xl p-6 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Área:</span>{' '}
                    <strong className="text-gray-900 dark:text-white">{lista.area}</strong>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Nivel:</span>{' '}
                    <strong className="text-gray-900 dark:text-white">{lista.nivel}</strong>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Modalidad:</span>{' '}
                    <strong className="text-gray-900 dark:text-white">{lista.modalidad}</strong>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Fase:</span>{' '}
                    <strong className="text-gray-900 dark:text-white">{lista.fase}</strong>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Evaluador:</span>{' '}
                    <strong className="text-gray-900 dark:text-white">{lista.evaluador}</strong>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Enviado:</span>{' '}
                    <strong className="text-gray-900 dark:text-white">{lista.fecha}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Mostrando {listasPendientes.length} de {listasPendientes.length} listas
          </div>
        </div>
      </div>
    </>
  );
};

export default AprobacionCalificacionesLista;