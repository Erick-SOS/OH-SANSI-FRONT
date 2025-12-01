// src/pages/SeleccionarGestionPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SeleccionarGestionPage: React.FC = () => {
  const [nombreGestion, setNombreGestion] = useState<string>("");
  const [gestionesCreadas, setGestionesCreadas] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleCrearGestion = () => {
    const nombre = nombreGestion.trim();
    if (!nombre) return;

    // Evitar duplicados
    setGestionesCreadas((prev) =>
      prev.includes(nombre) ? prev : [...prev, nombre]
    );

    setNombreGestion("");
  };

  const handleVerEstado = (gestion: string) => {
    const encoded = encodeURIComponent(gestion);
    navigate(`/fases/estado-olimpiada/${encoded}`);
  };

  return (
    <div className="p-6">
      {/* Título principal */}
      <h1 className="text-2xl font-bold mb-4">Crear gestión</h1>

      {/* Card: crear gestión */}
      <div className="bg-white dark:bg-gray-800 border rounded-xl p-4 shadow mb-6">
        <h2 className="text-lg font-semibold mb-1">
          Ingrese un nombre para la gestión
        </h2>
        <p className="text-sm text-gray-500 mb-3">
          Ejemplo: <span className="italic">"OLIMPIADAS 1/2025"</span>
        </p>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Escribe el nombre de la gestión..."
              value={nombreGestion}
              onChange={(e) => setNombreGestion(e.target.value)}
            />
          </div>

          {/* Botón ahora dice "Crear gestión" */}
          <button
            className="px-4 py-2 rounded-lg bg-blue-500 text-white disabled:opacity-60 md:self-auto self-end"
            disabled={!nombreGestion.trim()}
            onClick={handleCrearGestion}
          >
            Crear gestión
          </button>
        </div>
      </div>

      {/* Card separada: lista de gestiones creadas */}
      {gestionesCreadas.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border rounded-xl p-4 shadow">
          <h3 className="text-md font-semibold mb-2">Gestiones creadas</h3>

          <ul className="divide-y divide-gray-200">
            {gestionesCreadas.map((g) => (
              <li
                key={g}
                className="flex items-center justify-between py-2"
              >
                <span className="text-sm text-gray-800">{g}</span>
                <button
                  className="text-sm px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-blue-600 font-medium"
                  onClick={() => handleVerEstado(g)}
                >
                  Ver estado
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SeleccionarGestionPage;