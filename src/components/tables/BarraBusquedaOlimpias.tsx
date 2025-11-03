import React from 'react';

interface BarraBusquedaOlimpiasProps {
  terminoBusqueda: string;
  onBuscarChange: (termino: string) => void;
}

const BarraBusquedaOlimpias: React.FC<BarraBusquedaOlimpiasProps> = ({ terminoBusqueda, onBuscarChange }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={terminoBusqueda}
        onChange={(e) => onBuscarChange(e.target.value)}
        placeholder="Search..." 
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#465FFF] focus:border-[#465FFF] sm:text-sm"
      />
    </div>
  );
};

export default BarraBusquedaOlimpias;