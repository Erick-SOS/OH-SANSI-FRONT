/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import PageMeta from "../../components/common/PageMeta";
import MetricCard from "../../components/dashboard/MetricCard";
import DonutChartCard from "../../components/dashboard/DonutChartCard";

const DashboardEvaluador: React.FC = () => {
 
  const evaluadorName = "Juan Vera";

  const listasEnviadas = 12;
  const listasPendientes = 4;

  const calificacionesPorTipo = {
    labels: ["Individuales", "Grupales"],
    series: [78, 45],
  };

  
  const historialEnvios = JSON.parse(localStorage.getItem("historialEnviosEvaluador") || "[]");

  return (
    <>
      <PageMeta title="Dashboard Evaluador | Oh! SanSí Admin" description="Resumen de calificaciones" />

      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="text-sm text-slate-500 dark:text-slate-400">Bienvenido de nuevo,</p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{evaluadorName}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <MetricCard dotColor="bg-emerald-500" title="Listas enviadas" subtitle="Calificaciones finales enviadas" total={listasEnviadas} badgeLabel="Completadas" />
          <MetricCard dotColor="bg-amber-500" title="Pendientes" subtitle="Listas por calificar y enviar" total={listasPendientes} badgeLabel="Urgente" />
        </div>

        <div className="flex justify-center mb-10">
          <DonutChartCard title="Calificaciones realizadas por tipo" labels={calificacionesPorTipo.labels} series={calificacionesPorTipo.series} autoColorSeed={2} />
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <a href="/fases-de-evaluacion/individual" className="block p-6 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl text-white hover:from-indigo-600 hover:to-indigo-700 transition shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Calificar Individuales</h3>
                <p className="text-indigo-100 text-sm mt-1">{listasPendientes > 0 ? `${listasPendientes} pendientes` : "Todo al día"}</p>
              </div>
              <svg className="w-10 h-10 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>

          <a href="/fases-de-evaluacion/grupal" className="block p-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl text-white hover:from-purple-600 hover:to-purple-700 transition shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Calificar Grupales</h3>
                <p className="text-purple-100 text-sm mt-1">2 pendientes</p>
              </div>
              <svg className="w-10 h-10 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
        </div>

        {}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Mis calificaciones enviadas</h2>
          {historialEnvios.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Aún no has enviado ninguna lista.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3">Fecha y hora</th>
                    <th className="px-6 py-3">Tipo</th>
                    <th className="px-6 py-3">Cantidad</th>
                    <th className="px-6 py-3">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {historialEnvios.map((envio: any, index: number) => (
                    <tr key={index} className="border-b dark:border-gray-700">
                      <td className="px-6 py-4">{envio.fecha}</td>
                      <td className="px-6 py-4">{envio.tipo}</td>
                      <td className="px-6 py-4">{envio.cantidad}</td>
                      <td className="px-6 py-4">
                        <button className="text-indigo-600 hover:underline">Ver detalle</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardEvaluador;