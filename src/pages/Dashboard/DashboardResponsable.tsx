//import { useContext } from "react"; para auth
//import { AuthContext } from "../../context/AuthContext"; para auth
// src/pages/Dashboard/DashboardResponsable.tsx
import PageMeta from "../../components/common/PageMeta";
import MetricCard from "../../components/dashboard/MetricCard";
import DonutChartCard from "../../components/dashboard/DonutChartCard";
import { useDashboardStats } from "../../hooks/useDashboardStats";

const DashboardResponsable = () => {
  const { data, loading, error } = useDashboardStats();

  // Cambia este nombre según como esté exactamente en tu BD
  const areaDelResponsable = "Matemáticas"; // ← ¡¡AJUSTA ESTO!!

  if (loading) {
    return <div className="text-center py-20 text-slate-600">Cargando estadísticas...</div>;
  }

  if (error || !data) {
    return <div className="text-center py-20 text-red-600">Error al cargar datos</div>;
  }

  // Búsqueda tolerante (ignora tildes, mayúsculas, espacios)
  const normalize = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const areaEncontrada = data.porArea.find(a =>
    normalize(a.nombre) === normalize(areaDelResponsable)
  );

  const olimpistasEnMiArea = areaEncontrada?.cantidad || 0;

  return (
    <>
      <PageMeta
        title={`Dashboard ${areaDelResponsable} | Oh! SanSí Admin`}
        description={`Estadísticas del área de ${areaDelResponsable}`}
      />

      <div className="max-w-6xl mx-auto py-8">
        <div className="mb-8">
          <p className="text-sm text-slate-500">Área asignada:</p>
          <h1 className="text-3xl font-bold text-slate-900">{areaDelResponsable}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <MetricCard
            dotColor="bg-rose-500"
            title="Evaluadores"
            subtitle="Total de evaluadores en la olimpiada"
            total={data.evaluadores}
            badgeLabel="2025"
          />

          <MetricCard
            dotColor="bg-sky-500"
            title="Olimpistas en mi área"
            subtitle={`Inscritos en ${areaDelResponsable}`}
            total={olimpistasEnMiArea}
            badgeLabel="2025"
          />
        </div>

        <div className="flex justify-center">
          <DonutChartCard
            title={`Distribución por niveles - ${areaDelResponsable}`}
            labels={data.porNivel.map(n => n.nombre)}
            series={data.porNivel.map(n => n.cantidad)}
            autoColorSeed={0}
          />
        </div>
      </div>
    </>
  );
};

export default DashboardResponsable;