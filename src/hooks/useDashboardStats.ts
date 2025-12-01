// src/hooks/useDashboardStats.ts
import { useState, useEffect } from "react";

export interface DashboardStats {
    olimpistas: number;
    responsables: number;
    evaluadores: number;
    inscritosTotal: number;
    porNivel: { nombre: string; cantidad: number; porcentaje: number }[];
    porArea: { nombre: string; cantidad: number; porcentaje: number }[];
}

export const useDashboardStats = () => {
    const [data, setData] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("http://localhost:3000/api/estadisticas/dashboard");
                if (!res.ok) throw new Error("Error al cargar estadísticas");
                const json = await res.json();
                if (!json.success) throw new Error(json.message || "Error del servidor");

                setData(json.data);
            } catch (err: any) {
                setError(err.message || "Error de conexión");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return { data, loading, error };
};