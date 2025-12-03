import React from "react";

interface EliminarFilaModalProps {
  isOpen: boolean;
  tipo: string;
  nombre: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

const EliminarFilaModal: React.FC<EliminarFilaModalProps> = ({
  isOpen,
  tipo,
  nombre,
  onConfirmar,
  onCancelar,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 z-[9999]"
      onClick={onCancelar}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Eliminar {tipo}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          ¿Estás seguro de eliminar{" "}
          <strong>{nombre}</strong>? Esta acción no se puede deshacer.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancelar}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
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
