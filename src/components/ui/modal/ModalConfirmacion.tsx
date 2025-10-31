import React from 'react';

interface ModalConfirmacionProps {
  isOpen: boolean;
  titulo: string;
  mensaje: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

const ModalConfirmacion: React.FC<ModalConfirmacionProps> = ({
  isOpen,
  titulo,
  mensaje,
  onConfirmar,
  onCancelar,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {titulo}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          {mensaje}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancelar}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="px-4 py-2 text-sm font-medium text-white bg-[#465FFF] border border-[#465FFF] rounded-lg hover:bg-[#3a4fe6] transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacion; 