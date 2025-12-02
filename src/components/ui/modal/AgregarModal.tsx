// src/components/ui/modal/AgregarModal.tsx
import React, { useEffect, useState } from "react";

type Modalidad = "Individual" | "Grupal";

interface FormValues {
  nombre: string;
  codigo: string;
  descripcion: string;
  modalidad: Modalidad;
}

interface AgregarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (values: FormValues) => void;
  tipo: string; // "Área"
  modo: "agregar" | "editar";
  initialData?: FormValues;
}

const AgregarModal: React.FC<AgregarModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  tipo,
  modo,
  initialData,
}) => {
  const [form, setForm] = useState<FormValues>({
    nombre: "",
    codigo: "",
    descripcion: "",
    modalidad: "Individual",
  });

  // Cargar datos iniciales si se edita
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setForm(initialData);
    } else {
      setForm({
        nombre: "",
        codigo: "",
        descripcion: "",
        modalidad: "Individual",
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const camposIncompletos =
    !form.nombre.trim() || !form.codigo.trim() || !form.modalidad;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (camposIncompletos) return; // seguridad extra
    onConfirm(form);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 z-[9999]"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {modo === "editar" ? `Editar ${tipo}` : `Agregar ${tipo}`}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* NOMBRE (OBLIGATORIO) */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-100">
              Nombre del área <span className="text-red-500">*</span>
            </label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          {/* CÓDIGO (OBLIGATORIO) */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-100">
              Código del área <span className="text-red-500">*</span>
            </label>
            <input
              name="codigo"
              value={form.codigo}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          {/* DESCRIPCIÓN (OPCIONAL) */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-100">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          {/* MODALIDAD */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-100">
              Modalidad
            </label>
            <select
              name="modalidad"
              value={form.modalidad}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="Individual">Individual</option>
              <option value="Grupal">Grupal</option>
            </select>
          </div>

          {/* BOTONES */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={camposIncompletos}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${
                camposIncompletos
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {modo === "editar" ? "Guardar cambios" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgregarModal;
