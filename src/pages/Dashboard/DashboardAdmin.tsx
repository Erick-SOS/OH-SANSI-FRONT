// src/pages/Dashboard/DashboardAdmin.tsx
import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import MetricCard from "../../components/dashboard/MetricCard";
import DonutChartCard from "../../components/dashboard/DonutChartCard";
import { api } from "../../api";

// Tipos según el backend
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

const DashboardAdmin = () => {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api("/estadisticas/dashboard") as DashboardResponse;

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
            : "Ocurrió un error al obtener las estadísticas del dashboard.";
        setError(msg);
        setData(null);
      } finally {
        if (isMounted) setLoading(false);
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
          Cargando estadísticas del tablero administrativo…
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-sm font-medium text-red-600 dark:text-red-400">
          Error al obtener las estadísticas: {error || "No se pudieron cargar los datos del dashboard."}
        </div>
      </div>
    );
  }

  const nivelesLabels = data.porNivel.map((n) => n.nombre);
  const nivelesSeries = data.porNivel.map((n) => n.porcentaje);

  const areasLabels = data.porArea.map((a) => a.nombre);
  const areasSeries = data.porArea.map((a) => a.porcentaje);

  return (
    <>
      <PageMeta
        title="Dashboard Administrador | Oh! SanSí Admin"
        description="Panel de estadísticas generales de participación en las olimpiadas."
      />

      {/* Encabezado principal */}
      <div className="mb-4 md:mb-6 flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Participación en las olimpiadas
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Total de inscripciones registradas:{" "}
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {data.inscritosTotal}
          </span>
          . Las métricas y gráficos se calculan a partir de los registros actuales.
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-12 gap-4 md:gap-6 mb-10">
        <div className="col-span-12 md:col-span-4">
          <MetricCard
            dotColor="bg-sky-700"
            title="Olimpistas"
            subtitle="Olimpistas únicos registrados en el sistema."
            total={data.olimpistas}
          />
        </div>

        <div className="col-span-12 md:col-span-4">
          <MetricCard
            dotColor="bg-indigo-500"
            title="Responsables"
            subtitle="Responsables activos asociados a las áreas y niveles."
            total={data.responsables}
          />
        </div>

        <div className="col-span-12 md:col-span-4">
          <MetricCard
            dotColor="bg-rose-500"
            title="Evaluadores"
            subtitle="Evaluadores activos registrados para el proceso de calificación."
            total={data.evaluadores}
          />
        </div>
      </div>

      {/* Gráficos de distribución */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Distribución por nivel */}
        <div className="col-span-12 lg:col-span-6 space-y-4">
          <DonutChartCard
            title="Distribución de inscritos por nivel"
            labels={nivelesLabels}
            series={nivelesSeries}
            autoColorSeed={0}
          />

          {data.porNivel.length > 0 && (
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
          )}
        </div>

        {/* Distribución por área */}
        <div className="col-span-12 lg:col-span-6 space-y-4">
          <DonutChartCard
            title="Distribución de inscritos por área"
            labels={areasLabels}
            series={areasSeries}
            autoColorSeed={1}
          />

          {data.porArea.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs md:text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
              <p className="mb-2 font-medium text-slate-800 dark:text-slate-100">
                Detalle por área
              </p>
              <div className="space-y-1.5">
                {data.porArea.map((area) => (
                  <div
                    key={area.nombre}
                    className="flex items-center justify-between text-slate-600 dark:text-slate-300"
                  >
                    <span className="truncate pr-2">{area.nombre}</span>
                    <span className="whitespace-nowrap">
                      {area.cantidad} inscritos · {area.porcentaje}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardAdmin;
