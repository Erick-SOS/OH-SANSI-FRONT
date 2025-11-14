// src/components/ui/modal/AgregarModal.tsx
import React, { useState } from 'react';

interface AgregarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (formData: { nombre: string; codigo: string; descripcion: string }) => void;
  tipo: 'Área' | 'Nivel';
}

const AgregarModal: React.FC<AgregarModalProps> = ({ isOpen, onClose, onConfirm, tipo }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    descripcion: '',
  });

  const [errores, setErrores] = useState({
    nombre: '',
    codigo: '',
    descripcion: '',
  });

  if (!isOpen) return null;

  const validar = () => {
    const nuevosErrores = { nombre: '', codigo: '', descripcion: '' };

    if (!formData.nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio';
    if (!formData.codigo.trim()) nuevosErrores.codigo = 'El código es obligatorio';
    else if (!/^[A-Z0-9]{2,6}$/.test(formData.codigo)) nuevosErrores.codigo = 'Código: 2-6 caracteres (A-Z, 0-9)';
    if (!formData.descripcion.trim()) nuevosErrores.descripcion = 'La descripción es obligatoria';

    setErrores(nuevosErrores);
    return Object.values(nuevosErrores).every(v => !v);
  };

  const handleSubmit = () => {
    if (validar()) {
      onConfirm({
        nombre: formData.nombre.trim(),
        codigo: formData.codigo.trim().toUpperCase(),
        descripcion: formData.descripcion.trim(),
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({ nombre: '', codigo: '', descripcion: '' });
    setErrores({ nombre: '', codigo: '', descripcion: '' });
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
        height: '100vh',
      }}
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-md dark:shadow-gray-900"
        style={{ position: 'relative', zIndex: 100000 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Agregar nuevo {tipo.toLowerCase()}
        </h3>

        <div className="space-y-3">
          {/* NOMBRE */}
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              {tipo} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => {
                setFormData({ ...formData, nombre: e.target.value });
                setErrores({ ...errores, nombre: '' });
              }}
              className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 transition-all
                ${errores.nombre
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-400 focus:border-blue-400'
                }`}
              placeholder={`Nombre del ${tipo.toLowerCase()}`}
              maxLength={100}
            />
            {errores.nombre && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errores.nombre}</p>}
          </div>

          {/* CÓDIGO */}
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Código de {tipo.toLowerCase()} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.codigo}
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                setFormData({ ...formData, codigo: value });
                setErrores({ ...errores, codigo: '' });
              }}
              className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 transition-all
                ${errores.codigo
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-400 focus:border-blue-400'
                }`}
              placeholder={`Código de ${tipo.toLowerCase()}`}
              maxLength={6}
            />
            {errores.codigo && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errores.codigo}</p>}
          </div>

          {/* DESCRIPCIÓN */}
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => {
                setFormData({ ...formData, descripcion: e.target.value });
                setErrores({ ...errores, descripcion: '' });
              }}
              className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 transition-all resize-none
                ${errores.descripcion
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-400 focus:border-blue-400'
                }`}
              rows={3}
              placeholder={`Descripción del ${tipo.toLowerCase()} de competencia`}
              maxLength={500}
            />
            {errores.descripcion && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errores.descripcion}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md transition disabled:opacity-50"
            disabled={!formData.nombre.trim() || !formData.codigo.trim() || !formData.descripcion.trim()}
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgregarModal;