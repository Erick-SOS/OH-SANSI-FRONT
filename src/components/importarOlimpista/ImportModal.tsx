// src/components/importarOlimpista/ImportModal.tsx
import React, { useState, useRef } from "react";
import { Upload, X, CheckCircle2, XCircle } from "lucide-react";

interface Props {
  importOk: string | null;
  importErr: string | null;
  onInputChange: React.ChangeEventHandler<HTMLInputElement>;
  onClose: () => void;
  onImport: () => void;
  onDownloadErrors?: () => void;
  hasErrors?: boolean;
}

export const ImportModal: React.FC<Props> = ({
  importOk,
  importErr,
  onInputChange,
  onClose,
  onImport,
  onDownloadErrors,
  hasErrors,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.name.endsWith(".csv")) {
      setFile(selected);
      onInputChange(e);
    } else if (selected) {
      alert("Solo archivos .CSV");
    }
  };

  const handleRemove = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="relative">
      {/* BOTÓN X */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
      >
        <X className="w-5 h-5" />
      </button>

      {/* TÍTULO */}
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6 text-center">
        Importar Olimpistas (CSV)
      </h2>

      {/* MENSAJES */}
      {importOk && !importOk.includes("Procesando") && (
        <div className="mb-4 rounded-lg bg-green-50 dark:bg-green-900/20 p-3 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 text-sm text-green-800 dark:text-green-300">
            <CheckCircle2 className="h-4 w-4" />
            {importOk}
          </div>
        </div>
      )}

      {importErr && !importErr.includes("Procesando") && (
        <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 p-3 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 text-sm text-red-800 dark:text-red-300">
            <XCircle className="h-4 w-4" />
            {importErr}
          </div>
        </div>
      )}

      {/* UPLOAD */}
      <div className="mb-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
        </div>

        <p className="text-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Sube aquí tu archivo
        </p>
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mb-4">
          Solo se permiten archivos de tipo <span className="font-medium">.CSV</span>
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          id="csv-upload"
        />
        <label
          htmlFor="csv-upload"
          className="block w-full cursor-pointer rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-4 text-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-[#465FFF] hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors"
        >
          <Upload className="mx-auto mb-2 h-5 w-5 text-gray-400" />
          Buscar Archivo
        </label>

        {file && (
          <div className="mt-3 flex items-center justify-between rounded-lg border bg-gray-50 dark:bg-gray-700 p-3">
            <span className="truncate text-sm font-medium text-gray-900 dark:text-white">
              {file.name}
            </span>
            <button onClick={handleRemove} className="text-red-500 hover:text-red-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* BOTONES */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancelar
        </button>
        <button
          onClick={onImport}
          disabled={!file}
          className="rounded-lg bg-[#465FFF] px-4 py-2 text-sm font-medium text-white hover:bg-[#3a4fe6] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Subir registros
        </button>
      </div>

      {hasErrors && onDownloadErrors && (
        <div className="mt-3 text-center">
          <button onClick={onDownloadErrors} className="text-xs text-yellow-600 dark:text-yellow-400 hover:underline">
            Descargar reporte de errores
          </button>
        </div>
      )}
    </div>
  );
};