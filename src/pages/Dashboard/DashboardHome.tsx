import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import EcommerceMetrics from "../../components/ecommerce/MetricasEcommerce";
import MonthlySalesChart from "../../components/ecommerce/GraficoVentasMensuales";
import StatisticsChart from "../../components/ecommerce/GraficoEstadisticas";
import MonthlyTarget from "../../components/ecommerce/ObjetivoMensual";
import RecentOrders from "../../components/ecommerce/OrdenesRecientes";
import DemographicCard from "../../components/ecommerce/TarjetaDemografica";
import PageMeta from "../../components/common/PaginaMeta";

const DashboardHome = () => {
  const { user } = useContext(AuthContext);

  return (
    <>
      <PageMeta
        title="Dashboard | Oh! SanSí Admin"
        description="Panel de administración - Olimpiadas Oh! SanSí 2025"
      />

      {/* Dashboard de e-commerce (tu contenido original) */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics />
          <MonthlySalesChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div>
      </div>

      {/* Accesos rápidos según rol (opcional, debajo del dashboard) */}
      {user?.rol && (
        <div className="mt-8 p-6 bg-gradient-to-r from-sky-50 to-cyan-50 dark:from-sky-900 dark:to-cyan-900 rounded-xl">
          <h3 className="text-lg font-semibold text-sky-800 dark:text-sky-100 mb-4">
            Accesos Rápidos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardHome;
