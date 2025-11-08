//import { useContext } from "react";para la auth
//import { AuthContext } from "../../context/AuthContext";para la auth
import PageMeta from "../../components/common/PageMeta";
import MetricCard from "../../components/dashboard/MetricCard";
import DonutChartCard from "../../components/dashboard/DonutChartCard";

const DashboardAdmin = () => {
  //const { user } = useContext(AuthContext); para la auth

  // Mock de datos: reemplazables con lo que venga del backend
  const totalOlimpistas = 3394;
  const totalResponsables = 10;
  const totalEvaluadores = 36;

  const nivelesData = {
    labels: ["Primaria", "Único", "Secundaria"],
    series: [1025, 844, 1525],
  };

  const areasData = {
    labels: ["Robótica", "Inglés", "Física", "Matemáticas"],
    series: [1255, 584, 150, 1405],
  };

  return (
    <>
      <PageMeta
        title="Dashboard Administrador | Oh! SanSí Admin"
        description="Participación general en las olimpiadas Oh! SanSí 2025"
      />

      {/* Título principal */}
      <div className="mb-6: mb-10">
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
            total={totalOlimpistas}
            badgeLabel="2025"
          />
        </div>

        <div className="col-span-12 md:col-span-4">
          <MetricCard
            dotColor="bg-indigo-500"
            title="Responsables"
            subtitle="Cantidad de responsables registrados"
            total={totalResponsables}
            badgeLabel="2025"
          />
        </div>

        <div className="col-span-12 md:col-span-4">
          <MetricCard
            dotColor="bg-rose-500"
            title="Evaluadores"
            subtitle="Cantidad de evaluadores registrados"
            total={totalEvaluadores}
            badgeLabel="2025"
          />
        </div>
      </div>

      {/* Donuts */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Por niveles */}
        <div className="col-span-12 lg:col-span-6 flex">
          <DonutChartCard
            title="Porcentaje de inscritos por niveles"
            labels={nivelesData.labels}
            series={nivelesData.series}
            autoColorSeed={0}
          />
        </div>

        {/* Por áreas */}
        <div className="col-span-12 lg:col-span-6 flex">
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
