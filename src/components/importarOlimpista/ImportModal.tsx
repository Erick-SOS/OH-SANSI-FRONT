import React, { useState } from "react";
import { AlertCircle, CheckCircle2, Download, Upload, X, FileWarning } from "lucide-react";

interface Props {
  importOk: string | null;
  importErr: string | null;
  onInputChange: React.ChangeEventHandler<HTMLInputElement>;
  onClose: () => void;
  onDownloadTemplate: () => void;
  onImport: () => void;
  // 🔹 nuevos props
  onDownloadErrors?: () => void;
  hasErrors?: boolean;
}

export const ImportModal: React.FC<Props> = ({
  importOk,
  importErr,
  onInputChange,
  onClose,
  onDownloadTemplate,
  onImport,
  onDownloadErrors,
  hasErrors,
}) => {
  const [fileSelected, setFileSelected] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange(e);
    const file = e.target.files?.[0] || null;
    setFileSelected(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/35" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl rounded-xl bg-white p-6 shadow-2xl">
        {/* Encabezado */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Importar Olimpistas (CSV)</h2>
          <div className="flex gap-2">
            <button
              onClick={onDownloadTemplate}
              className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm"
            >
              <Download className="h-4 w-4" /> Plantilla
            </button>
            {hasErrors && (
              <button
                onClick={onDownloadErrors}
                className="inline-flex items-center gap-2 rounded-md border border-yellow-400 bg-yellow-50 px-3 py-1.5 text-sm text-yellow-800 hover:bg-yellow-100"
              >
                <FileWarning className="h-4 w-4" /> Descargar errores
              </button>
            )}
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm"
            >
              <X className="h-4 w-4" /> Cerrar
            </button>
          </div>
        </div>

        {/* Mensajes */}
        {importOk && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-800">
            <CheckCircle2 className="h-4 w-4" /> {importOk}
          </div>
        )}
        {importErr && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 whitespace-pre-wrap">
            <AlertCircle className="h-4 w-4" /> {importErr}
          </div>
        )}

        {/* Zona de carga */}
        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 text-center">
          <Upload className="h-6 w-6 mb-3" />
          <div className="font-medium mb-2">
            Arrastra o selecciona un archivo CSV
          </div>
          <input type="file" accept=".csv,.xls,.xlsx" onChange={handleFileChange} />
          <p className="mt-2 text-xs text-gray-500">
            Encabezados requeridos: TIPO_PART, AREA_NOM, NIVEL_NOM, OLI_NOMBRE,
            OLI_AP_PAT, OLI_UNID_EDU, OLI_DEPTO
          </p>

          {fileSelected && (
            <button
              onClick={onImport}
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
            >
              <Upload className="h-4 w-4" /> Importar archivo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
