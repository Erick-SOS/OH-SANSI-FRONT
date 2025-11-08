//import { useContext } from "react"; para la auth
//import { AuthContext } from "../../context/AuthContext"; para la auth
import PageMeta from "../../components/common/PageMeta";
import MetricCard from "../../components/dashboard/MetricCard";
import DonutChartCard from "../../components/dashboard/DonutChartCard";

const DashboardResponsable = () => {
  //const { user } = useContext(AuthContext); para la auth

  const areaName = "Matemáticas";

  const totalOlimpistas = 1000;
  const totalEvaluadores = 36;

  const levelDistribution = {
    labels: ["Primaria", "Único", "Secundaria", "Universitario"],
    series: [155, 105, 450, 290],
  };

  return (
    <>
      <PageMeta
        title={`Dashboard ${areaName} | Oh! SanSí Admin`}
        description={`Estadísticas del área de ${areaName} - Olimpiadas Oh! SanSí 2025`}
      />

      {/* Contenedor centrado */}
      <div className="max-w-6xl mx-auto">
        {/* Encabezado */}
        <div className="mb-8">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Estadísticas del área de:
          </p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            {areaName}
          </h1>
        </div>

        {/* Cards arriba (lado a lado en desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <MetricCard
            dotColor="bg-rose-500"
            title="Evaluadores"
            subtitle="Cantidad de evaluadores registrados"
            total={totalEvaluadores}
            badgeLabel="2025"
          />

          <MetricCard
            dotColor="bg-sky-500"
            title="Olimpistas"
            subtitle="Cantidad de olímpistas registrados"
            total={totalOlimpistas}
            badgeLabel="2025"
          />
        </div>

        {/* Donut abajo y centrado */}
        <div className="flex justify-center">
          <DonutChartCard
            title="Porcentaje de inscritos por niveles"
            labels={levelDistribution.labels}
            series={levelDistribution.series}
            autoColorSeed={0}
          />
        </div>
      </div>
    </>
  );
};

export default DashboardResponsable;
