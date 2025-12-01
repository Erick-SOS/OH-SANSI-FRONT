// src/pages/Dashboard/DashboardAdmin.tsx
//import { useContext } from "react"; // para la auth
//import { AuthContext } from "../../context/AuthContext"; // para la auth
// src/pages/Dashboard/DashboardAdmin.tsx
import PageMeta from "../../components/common/PageMeta";
import MetricCard from "../../components/dashboard/MetricCard";
import DonutChartCard from "../../components/dashboard/DonutChartCard";
import { useDashboardStats } from "../../hooks/useDashboardStats";

const DashboardAdmin = () => {
  const { data, loading, error } = useDashboardStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-slate-600">Cargando estadísticas...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-600">Error: {error || "No se pudieron cargar los datos"}</div>
      </div>
    );
  }

  const nivelesData = {
    labels: data.porNivel.map((n) => n.nombre),
    series: data.porNivel.map((n) => n.cantidad),
  };

  const areasData = {
    labels: data.porArea.map((a) => a.nombre),
    series: data.porArea.map((a) => a.cantidad),
  };

  return (
    <>
      <PageMeta
        title="Dashboard Administrador | Oh! SanSí Admin"
        description="Participación general en las olimpiadas Oh! SanSí 2025"
      />

      <div className="mb-6 md:mb-10">
        <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          Participación en las olimpiadas
        </h1>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-12 gap-4 md:gap-6 mb-10">
        <div className="col-span-12 md:col-span-4">
          <MetricCard
            dotColor="bg-sky-700"
            title="Olimpistas"
            subtitle="Cantidad de olímpistas registrados"
            total={data.olimpistas}
            badgeLabel="2025"
          />
        </div>

        <div className="col-span-12 md:col-span-4">
          <MetricCard
            dotColor="bg-indigo-500"
            title="Responsables"
            subtitle="Cantidad de responsables registrados"
            total={data.responsables}
            badgeLabel="2025"
          />
        </div>

        <div className="col-span-12 md:col-span-4">
          <MetricCard
            dotColor="bg-rose-500"
            title="Evaluadores"
            subtitle="Cantidad de evaluadores registrados"
            total={data.evaluadores}
            badgeLabel="2025"
          />
        </div>
      </div>

      {/* Donuts */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 lg:col-span-6">
          <DonutChartCard
            title="Porcentaje de inscritos por niveles"
            labels={nivelesData.labels}
            series={nivelesData.series}
            autoColorSeed={0}
          />
        </div>

        <div className="col-span-12 lg:col-span-6">
          <DonutChartCard
            title="Porcentaje de inscritos por áreas"
            labels={areasData.labels}
            series={areasData.series}
            autoColorSeed={1}
          />
        </div>
      </div>
    </>
  );
};

export default DashboardAdmin;