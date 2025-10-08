import { useState } from "react";
import Label from "./Label";
import Input from "./input/InputField";
import { EyeIcon, EyeCloseIcon } from "../../icons";

interface PasswordFieldProps {
  password: string;
  confirmPassword: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PasswordField({
  password,
  confirmPassword,
  onChange,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {/* Campo Contraseña */}
      <div>
        <Label>
          Contraseña <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={onChange}
          />
          <button
            type="button"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? (
              <EyeIcon className="size-5" />
            ) : (
              <EyeCloseIcon className="size-5" />
            )}
          </button>
        </div>
      </div>

      {/* Campo Confirmar Contraseña */}
      <div>
        <Label>
          Confirmar Contraseña <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            type={showConfirm ? "text" : "password"}
            name="confirmPassword"
            placeholder="Repite tu contraseña"
            value={confirmPassword}
            onChange={onChange}
          />
          <button
            type="button"
            aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showConfirm ? (
              <EyeIcon className="size-5" />
            ) : (
              <EyeCloseIcon className="size-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}