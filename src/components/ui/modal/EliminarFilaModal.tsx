import React from 'react';

interface EliminarFilaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  area: string;
  nivel: string;
}

const EliminarFilaModal: React.FC<EliminarFilaModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  area,
  nivel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-400/50 flex items-center justify-center z-[100000]">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Confirmar eliminación
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          ¿Estás seguro de que quieres eliminar el área <span className="font-medium">"{area}"</span> 
          del nivel <span className="font-medium">"{nivel}"</span>? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EliminarFilaModal;