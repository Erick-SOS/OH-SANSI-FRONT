import React, { FC } from "react";
import Label from "./Label";
import Input from "./input/InputField";

interface DocumentFieldProps {
  tipo_documento: string;
  numero_documento: string;
  complemento_documento?: string;  
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void; // ←
  invalidNumero?: boolean;
  validNumero?: boolean;
  validComplemento?: boolean;  
  numeroHint?: string;
  className?: string;
}

const DocumentField: FC<DocumentFieldProps> = ({ tipo_documento, numero_documento, complemento_documento = "", onChange, onBlur, invalidNumero, validNumero, validComplemento, numeroHint, className = "" }) => {
  return (
    <div className={className}>
      <Label>Documento <span className="text-red-500">*</span></Label>
       <div className="grid grid-cols-12 gap-3 items-start">
        <div className="col-span-12 sm:col-span-2">
          <select
            name="tipo_documento"
            value={tipo_documento}
            onChange={onChange}
            onBlur={onBlur}
            aria-label="Tipo de documento"
            className="w-full border rounded-lg px-3 py-2 text-gray-700"
          >
            <option value="CI">CI</option>
            <option value="Pasaporte">Pasaporte</option>
          </select>
        </div>

        <div className="col-span-12 sm:col-span-7 relative">
          <Input
            type="text"
            name="numero_documento"
            placeholder="Número de documento"
            value={numero_documento}
            onChange={onChange as any}
            onBlur={onBlur as any}
            aria-label="Número de documento"
            error={invalidNumero}
            success={validNumero}
            className={numeroHint ? "mb-5" : ""}
          />
          {/* Hint absoluto: no empuja al complemento */}
          {numeroHint && (
            <p className="absolute left-0 top-[2.75rem] text-xs text-error-500">
              {numeroHint}
            </p>
          )}
        </div>

           
        <div className="col-span-12 sm:col-span-3 relative">
          <span className="absolute -top-4 left-0 text-xs text-gray-500">
            Complemento
          </span>
          <Input
            type="text"
            name="complemento_documento"
            placeholder="opcional"
            value={complemento_documento}
            onChange={onChange as any}
            onBlur={onBlur as any}
            className="uppercase tracking-wider"
            success={!!validComplemento}
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentField;