import React, { useState } from 'react';

interface AreaNivel {
  area: string;
  nivel: string;
  responsable: string;
  modalidad: string;
}

interface AgregarAreaYNivelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (nuevoRegistro: Omit<AreaNivel, 'id' | 'seleccionado'>) => void;
}

const AgregarAreaYNivelModal: React.FC<AgregarAreaYNivelModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const [formData, setFormData] = useState({
    area: '',
    nivel: '',
    responsable: '',
    modalidad: 'Grupal'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.area && formData.nivel && formData.responsable) {
      onConfirm(formData);
      setFormData({ area: '', nivel: '', responsable: '', modalidad: 'Grupal' });
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-gray-400/50 flex items-center justify-center z-[100000]">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Agregar Nueva Área y Nivel
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Área *
              </label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#465FFF] dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nivel *
              </label>
              <input
                type="text"
                name="nivel"
                value={formData.nivel}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#465FFF] dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Responsable *
              </label>
              <input
                type="text"
                name="responsable"
                value={formData.responsable}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#465FFF] dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Modalidad *
              </label>
              <select
                name="modalidad"
                value={formData.modalidad}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#465FFF] dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="Grupal">Grupal</option>
                <option value="Individual">Individual</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-[#465FFF] rounded-lg hover:bg-[#3a4fe6] transition-colors"
            >
              Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgregarAreaYNivelModal;