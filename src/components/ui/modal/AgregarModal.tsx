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

  // === SOLO AGREGADO: Errores y límites ===
  const [errors, setErrors] = useState<{
    nombre?: string;
    codigo?: string;
    descripcion?: string;
  }>({});

  const maxLengths = {
    nombre: tipo === 'Area' ? 150 : 100,
    codigo: 50,
    descripcion: 500,
  };
  

  if (!isOpen) return null;

  const handleSubmit = () => {
   
    const newErrors: typeof errors = {};

    if (!formData.nombre.trim()) newErrors.nombre = 'Obligatorio';
    else if (formData.nombre.trim().length < 3) newErrors.nombre = 'Mínimo 3 caracteres';
    else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombre)) newErrors.nombre = 'Solo letras';

    if (!formData.codigo.trim()) newErrors.codigo = 'Obligatorio';
    else if (!/^[A-Z0-9-]+$/.test(formData.codigo)) newErrors.codigo = 'Formato inválido';

    if (!formData.descripcion.trim()) newErrors.descripcion = 'Obligatoria';
    else if (formData.descripcion.trim().length < 10) newErrors.descripcion = 'Mínimo 10 caracteres';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    

    
    onConfirm(formData);
    setFormData({ nombre: '', codigo: '', descripcion: '' });
    setErrors({});
  };

  const handleClose = () => {
    setFormData({ nombre: '', codigo: '', descripcion: '' });
    setErrors({});
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
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, nombre: value });
                // === SOLO AGREGADO: Validar en tiempo real ===
                const error = !value.trim() ? 'Obligatorio' :
                              value.trim().length < 3 ? 'Mínimo 3 caracteres' :
                              !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value) ? 'Solo letras' : '';
                setErrors(prev => ({ ...prev, nombre: error }));
                
              }}
              maxLength={maxLengths.nombre}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white outline-none transition-all"
              placeholder={tipo === 'Area' ? 'Nombre del área' : 'Nombre del nivel'}
            />
            {}
            <div className="flex justify-between items-center mt-1">
              {errors.nombre && <p className="text-xs text-red-600 dark:text-red-400">{errors.nombre}</p>}
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                {formData.nombre.length}/{maxLengths.nombre}
              </span>
            </div>
            {}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Código de {tipo === 'Area' ? 'Área' : 'Nivel'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.codigo}
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                setFormData({ ...formData, codigo: value });
               
                const error = !value.trim() ? 'Obligatorio' :
                              !/^[A-Z0-9-]+$/.test(value) ? 'Formato inválido' : '';
                setErrors(prev => ({ ...prev, codigo: error }));
                
              }}
              maxLength={maxLengths.codigo}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white outline-none transition-all"
              placeholder={`Código de ${tipo === 'Area' ? 'área' : 'nivel'}`}
            />
            {}
            <div className="flex justify-between items-center mt-1">
              {errors.codigo && <p className="text-xs text-red-600 dark:text-red-400">{errors.codigo}</p>}
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                {formData.codigo.length}/{maxLengths.codigo}
              </span>
            </div>
            {}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, descripcion: value });
                
                const error = !value.trim() ? 'Obligatoria' :
                              value.trim().length < 10 ? 'Mínimo 10 caracteres' : '';
                setErrors(prev => ({ ...prev, descripcion: error }));
               
              }}
              maxLength={maxLengths.descripcion}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white outline-none transition-all"
              placeholder="Descripción del área o nivel"
            />
            {}
            <div className="flex justify-between items-center mt-1">
              {errors.descripcion && <p className="text-xs text-red-600 dark:text-red-400">{errors.descripcion}</p>}
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                {formData.descripcion.length}/{maxLengths.descripcion}
              </span>
            </div>
            {}
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
            disabled={
              !formData.nombre.trim() ||
              !formData.codigo.trim() ||
              !formData.descripcion.trim() ||
              !!errors.nombre ||
              !!errors.codigo ||
              !!errors.descripcion
            }
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgregarModal;