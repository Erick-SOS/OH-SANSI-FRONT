import React, { FC } from "react";
import Label from "./Label";
import Input from "./input/InputField";

interface DocumentFieldProps {
  tipo_documento: string;
  numero_documento: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void; // ←
  invalidNumero?: boolean;
  validNumero?: boolean;
  numeroHint?: string;
  className?: string;
}

const DocumentField: FC<DocumentFieldProps> = ({ tipo_documento, numero_documento, onChange, onBlur, invalidNumero, validNumero, numeroHint, className = "" }) => {
  return (
    <div className={className}>
      <Label>Documento <span className="text-red-500">*</span></Label>
      <div className="flex gap-3">
        <div className="w-1/3">
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
        <div className="flex-1">
          <Input
            type="text"
            name="numero_documento"
            placeholder="Número de documento"
            value={numero_documento}
            onChange={onChange as any}
            onBlur={onBlur as any}
            error={Boolean(invalidNumero)}  
            success={Boolean(validNumero)} 
            hint={numeroHint}       
            aria-label="Número de documento"
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentField;