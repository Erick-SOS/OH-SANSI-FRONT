// src/pages/Dashboard/DashboardResponsable.tsx
import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import MetricCard from "../../components/dashboard/MetricCard";
import DonutChartCard from "../../components/dashboard/DonutChartCard";
import { api } from "../../api";

// Tipos según la respuesta de /api/estadisticas/dashboard
type NivelStat = {
  nombre: string;
  cantidad: number;
  porcentaje: number;
};

type AreaStat = {
  nombre: string;
  cantidad: number;
  porcentaje: number;
};

type DashboardStats = {
  olimpistas: number;
  responsables: number;
  evaluadores: number;
  inscritosTotal: number;
  porNivel: NivelStat[];
  porArea: AreaStat[];
};

type DashboardResponse = {
  success: boolean;
  data: DashboardStats;
  cached?: boolean;
};

const DashboardResponsable = () => {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");

        const res = (await api("/estadisticas/dashboard")) as DashboardResponse;

        if (!res.success || !res.data) {
          throw new Error("No se recibieron estadísticas válidas desde el servidor.");
        }

        if (isMounted) {
          setData(res.data);
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg =
          err instanceof Error
            ? err.message
            : "Ocurrió un error al obtener las estadísticas.";
        setError(msg);
        setData(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-slate-600 dark:text-slate-300">
          Cargando estadísticas…
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-sm font-medium text-red-600 dark:text-red-400">
          Error al obtener las estadísticas: {error || "No se pudieron cargar los datos."}
        </div>
      </div>
    );
  }

  // Donut: usamos directamente los porcentajes por nivel que envía el backend
  const nivelesLabels = data.porNivel.map((n) => n.nombre);
  const nivelesSeries = data.porNivel.map((n) => n.porcentaje);

  return (
    <>
      <PageMeta
        title="Dashboard Responsable | Oh! SanSí Admin"
        description="Vista general de estadísticas de la olimpiada para responsables."
      />

      <div className="max-w-6xl mx-auto py-6 md:py-8">
        {/* Encabezado genérico (sin datos personales ni área fija) */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Resumen de participación
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Los indicadores se calculan a partir de los registros actuales en el sistema.
          </p>
        </div>

        {/* Métricas principales (solo datos que vienen del backend) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-10">
          <MetricCard
            dotColor="bg-rose-500"
            title="Evaluadores activos"
            subtitle="Evaluadores registrados en la olimpiada."
            total={data.evaluadores}
          />

          <MetricCard
            dotColor="bg-sky-500"
            title="Olimpistas registrados"
            subtitle="Olimpistas con participación registrada."
            total={data.olimpistas}
          />
        </div>

        {/* Distribución por niveles (porcentajes del backend) */}
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12 lg:col-span-8">
            <DonutChartCard
              title="Distribución porcentual de inscritos por nivel"
              labels={nivelesLabels}
              series={nivelesSeries}
              autoColorSeed={3}
            />
          </div>

          {data.porNivel.length > 0 && (
            <div className="col-span-12 lg:col-span-4">
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs md:text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
                <p className="mb-2 font-medium text-slate-800 dark:text-slate-100">
                  Detalle por nivel
                </p>
                <div className="space-y-1.5">
                  {data.porNivel.map((nivel) => (
                    <div
                      key={nivel.nombre}
                      className="flex items-center justify-between text-slate-600 dark:text-slate-300"
                    >
                      <span className="truncate pr-2">{nivel.nombre}</span>
                      <span className="whitespace-nowrap">
                        {nivel.cantidad} inscritos · {nivel.porcentaje}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardResponsable;
