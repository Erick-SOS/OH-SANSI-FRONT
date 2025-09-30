import React from 'react';

interface EliminarFilaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tipo: 'Area' | 'Nivel' | '';
  nombre: string;
  nivel?: string; // Nombre del nivel si es que se proporciona
}

const EliminarFilaModal: React.FC<EliminarFilaModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  tipo,
  nombre,
  nivel
}) => {
  if (!isOpen) return null;

  // Generar el mensaje dinámico según el tipo
  const getMensaje = () => {
    if (tipo === 'Area' && nivel) {
      return (
        <>
          ¿Estás seguro de que quieres eliminar el área <strong>"{nombre}"</strong> del nivel <strong>"{nivel}"</strong>? Esta acción no se puede deshacer.
        </>
      );
    } else if (tipo === 'Area') {
      return (
        <>
          ¿Estás seguro de que quieres eliminar el área <strong>"{nombre}"</strong>? Esta acción no se puede deshacer.
        </>
      );
    } else if (tipo === 'Nivel') {
      return (
        <>
          ¿Estás seguro de que quieres eliminar el nivel <strong>"{nombre}"</strong>? Esta acción no se puede deshacer.
        </>
      );
    } else {
      return (
        <>
          ¿Estás seguro de que quieres eliminar <strong>"{nombre}"</strong>? Esta acción no se puede deshacer.
        </>
      );
    }
  };

  return (
    <div 
      className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center" 
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        zIndex: 99999,
        position: 'fixed',
        width: '100vw',
        height: '100vh'
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" style={{ position: 'relative', zIndex: 100000 }}>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Confirmar eliminación
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {getMensaje()}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
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