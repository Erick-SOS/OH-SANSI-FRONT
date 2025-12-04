import axios from 'axios';

// Configuración base de axios (ajusta la URL base según tu entorno)
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// Interceptor para agregar el token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface EvaluacionItem {
    id: number;
    nombre: string;
    ci?: string; // Opcional porque en grupal no hay CI visible por defecto o es diferente
    codigo: number | string;
    areaCompetencia: string;
    nivel: string;
    modalidad: 'INDIVIDUAL' | 'GRUPAL';
    nota: number;
    observacion: string;
    desclasificado?: boolean;
    motivo?: string;
    tipo: 'INDIVIDUAL' | 'GRUPAL';
}

export const EvaluadorService = {
    getAssignedOlympians: async (): Promise<EvaluacionItem[]> => {
        const response = await api.get('/evaluacion-individual/assigned');
        return response.data.data;
    },
};
