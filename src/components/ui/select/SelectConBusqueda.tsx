// src/components/ui/select/SelectConBusqueda.tsx
import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
} from "react";

interface SelectConBusquedaProps {
  opciones: string[];
  value?: string;
  placeholder?: string;
  onChange: (valor: string) => void;
}

const SelectConBusqueda: React.FC<SelectConBusquedaProps> = ({
  opciones,
  value,
  placeholder = "Seleccionar...",
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const contenedorRef = useRef<HTMLDivElement | null>(null);

  // cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const opcionesFiltradas = useMemo(() => {
    const term = busqueda.toLowerCase();
    return opciones.filter((op) => op.toLowerCase().includes(term));
  }, [opciones, busqueda]);

  const handleSelect = (opcion: string) => {
    onChange(opcion);
    setOpen(false);
    setBusqueda("");
  };

  return (
    <div className="relative w-56" ref={contenedorRef}>
      {/* Botón principal */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white shadow-sm hover:bg-gray-50"
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <svg
          className={`h-4 w-4 text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.25 7.5L10 12.25L14.75 7.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          {/* Buscador */}
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar..."
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Opciones */}
          <div className="max-h-48 overflow-auto py-1">
            {opcionesFiltradas.length === 0 && (
              <div className="px-3 py-2 text-xs text-gray-400">
                No se encontraron resultados
              </div>
            )}
            {opcionesFiltradas.map((op) => (
              <button
                key={op}
                type="button"
                onClick={() => handleSelect(op)}
                className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 ${
                  op === value ? "bg-blue-50 text-blue-600" : "text-gray-700"
                }`}
              >
                {op}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectConBusqueda;