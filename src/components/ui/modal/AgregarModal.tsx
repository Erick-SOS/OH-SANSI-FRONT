import React, { useState } from 'react';

interface AgregarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (formData: { nombre: string; codigo: string; descripcion: string }) => void;
  tipo: 'Area' | 'Nivel' | '';
}

const AgregarModal: React.FC<AgregarModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  tipo
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    descripcion: '',
  });

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (formData.nombre.trim()) {
      onConfirm(formData);
      setFormData({ nombre: '', codigo: '', descripcion: '' });
    }
  };

  const handleClose = () => {
    setFormData({ nombre: '', codigo: '', descripcion: '' });
    onClose();
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
        <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">
          {tipo === 'Area' ? 'Agregar Nueva Área' : 'Agregar Nuevo Nivel'}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {tipo === 'Area' ? 'Área' : 'Nivel'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              maxLength={tipo === 'Area' ? 150 : 100}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white outline-none transition-all"
              placeholder={tipo === 'Area' ? 'Nombre del área' : 'Nombre del nivel'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Código de {tipo === 'Area' ? 'Área' : 'Nivel'}
            </label>
            <input
              type="text"
              value={formData.codigo}
              onChange={(e) => setFormData({...formData, codigo: e.target.value})}
              maxLength={50}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white outline-none transition-all"
              placeholder={`Código de ${tipo === 'Area' ? 'área' : 'nivel'}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white outline-none transition-all"
              placeholder="Descripción del área o nivel"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!formData.nombre.trim()}
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgregarModal;