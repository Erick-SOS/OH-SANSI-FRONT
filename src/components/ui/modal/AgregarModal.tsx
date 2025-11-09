import React, { useState, useEffect } from 'react';

interface AgregarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (formData: { nombre: string; codigo: string; descripcion: string }) => void;
  tipo: 'Area' | 'Nivel';
}

interface Errores {
  nombre?: string;
  codigo?: string;
  descripcion?: string;
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

  const [errores, setErrores] = useState<Errores>({});
  const [touched, setTouched] = useState({
    nombre: false,
    codigo: false,
    descripcion: false,
  });

  const resetForm = () => {
    setFormData({ nombre: '', codigo: '', descripcion: '' });
    setErrores({});
    setTouched({ nombre: false, codigo: false, descripcion: false });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Validación
  useEffect(() => {
    const nuevosErrores: Errores = {};
    const nombreTrim = formData.nombre.trim();
    const codigoTrim = formData.codigo.trim();
    const descripcionTrim = formData.descripcion.trim();

    if (touched.nombre) {
      if (!nombreTrim) nuevosErrores.nombre = 'Este campo es obligatorio.';
      else if (nombreTrim.length < 3) nuevosErrores.nombre = 'Mínimo 3 caracteres.';
      else if (nombreTrim.length > (tipo === 'Area' ? 150 : 100))
        nuevosErrores.nombre = `Máximo ${tipo === 'Area' ? 150 : 100} caracteres.`;
      else if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-()]+$/.test(nombreTrim))
        nuevosErrores.nombre = 'Solo letras, números, espacios, guiones y paréntesis.';
    }

    if (touched.codigo) {
      if (!codigoTrim) nuevosErrores.codigo = 'Este campo es obligatorio.';
      else if (codigoTrim.length > 50) nuevosErrores.codigo = 'Máximo 50 caracteres.';
      else if (!/^[a-zA-Z0-9_-]+$/.test(codigoTrim))
        nuevosErrores.codigo = 'Solo letras, números, guiones y guiones bajos.';
    }

    if (touched.descripcion) {
      if (!descripcionTrim) nuevosErrores.descripcion = 'Este campo es obligatorio.';
      else if (descripcionTrim.length > 500) nuevosErrores.descripcion = 'Máximo 500 caracteres.';
    }

    setErrores(nuevosErrores);
  }, [formData, touched, tipo]);

  const handleSubmit = () => {
    setTouched({ nombre: true, codigo: true, descripcion: true });

    const nombreTrim = formData.nombre.trim();
    const codigoTrim = formData.codigo.trim();
    const descripcionTrim = formData.descripcion.trim();

    if (!nombreTrim || !codigoTrim || !descripcionTrim || errores.nombre || errores.codigo || errores.descripcion) {
      return;
    }

    onConfirm({
      nombre: nombreTrim,
      codigo: codigoTrim,
      descripcion: descripcionTrim,
    });

    handleClose();
  };

  if (!isOpen) return null;

  const maxNombre = tipo === 'Area' ? 150 : 100;
  const isFormInvalid =
    !formData.nombre.trim() ||
    !formData.codigo.trim() ||
    !formData.descripcion.trim() ||
    !!errores.nombre ||
    !!errores.codigo ||
    !!errores.descripcion;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Título */}
        <h3 className="mb-6 text-xl font-semibold text-gray-900">
          {tipo === 'Area' ? 'Agregar Nueva Área' : 'Agregar Nuevo Nivel'}
        </h3>

        <div className="space-y-6">

          {/* NOMBRE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {tipo === 'Area' ? 'Área' : 'Nivel'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              onBlur={() => setTouched({ ...touched, nombre: true })}
              maxLength={maxNombre}
              placeholder={`Ej: ${tipo === 'Area' ? 'Matemáticas' : 'Primaria'}`}
              className={`w-full rounded-md border ${
                errores.nombre ? 'border-red-500' : 'border-gray-300'
              } px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
            />
            {errores.nombre && <p className="mt-1 text-xs text-red-600">{errores.nombre}</p>}
          </div>

          {/* CÓDIGO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.codigo}
              onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
              onBlur={() => setTouched({ ...touched, codigo: true })}
              maxLength={50}
              placeholder={`Ej: ${tipo === 'Area' ? 'MAT-001' : 'NIV-001'}`}
              className={`w-full rounded-md border ${
                errores.codigo ? 'border-red-500' : 'border-gray-300'
              } px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
            />
            {errores.codigo && <p className="mt-1 text-xs text-red-600">{errores.codigo}</p>}
          </div>

          {/* DESCRIPCIÓN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              onBlur={() => setTouched({ ...touched, descripcion: true })}
              maxLength={500}
              rows={3}
              placeholder="Descripción detallada del área o nivel"
              className={`w-full resize-none rounded-md border ${
                errores.descripcion ? 'border-red-500' : 'border-gray-300'
              } px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
            />
            <div className="mt-1 flex justify-end">
              <span className={`text-xs ${errores.descripcion ? 'text-red-600' : 'text-gray-500'}`}>
                {formData.descripcion.length}/500
              </span>
            </div>
            {errores.descripcion && <p className="mt-1 text-xs text-red-600">{errores.descripcion}</p>}
          </div>
        </div>

        {/* Botones */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isFormInvalid}
            className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgregarModal;