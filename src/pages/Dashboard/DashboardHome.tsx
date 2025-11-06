import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";

const DashboardHome = () => {
  const { user, logout } = useContext(AuthContext);

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
            {user.rol === "ADMINISTRADOR" && (
              <>
                <Link
                  to="/areas"
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center hover:shadow-md transition"
                >
                  <span className="block text-sm font-medium text-sky-700 dark:text-sky-300">
                    Áreas
                  </span>
                </Link>
                <Link
                  to="/reportes"
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center hover:shadow-md transition"
                >
                  <span className="block text-sm font-medium text-cyan-700 dark:text-cyan-300">
                    Reportes
                  </span>
                </Link>
              </>
            )}
            {user.rol === "EVALUADOR" && (
              <Link
                to="/fases-de-evaluacion"
                className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center hover:shadow-md transition"
              >
                <span className="block text-sm font-medium text-teal-700 dark:text-teal-300">
                  Evaluaciones
                </span>
              </Link>
            )}
            {user.rol === "RESPONSABLE" && (
              <Link
                to="/lista-de-inscritos"
                className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center hover:shadow-md transition"
              >
                <span className="block text-sm font-medium text-indigo-700 dark:text-indigo-300">
                  Inscritos
                </span>
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardHome;