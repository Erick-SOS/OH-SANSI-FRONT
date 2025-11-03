import { useState } from "react";
import Label from "./Label";
import Input from "./input/InputField";

interface PasswordFieldProps {
  password: string;
  confirmPassword: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  invalidPassword?: boolean;
  invalidConfirm?: boolean;
  blockSpaces?: boolean;   
  validPassword?: boolean;
  validConfirm?: boolean;
  passwordHint?: string;
  confirmHint?: string; 
}

export default function PasswordField({
  password,
  confirmPassword,
  onChange,
  onBlur, 
  invalidPassword = false,
  invalidConfirm = false,
  passwordHint,
  confirmHint,
  //blockSpaces = false,
  validPassword = false,
  validConfirm = false,  
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
            onBlur={onBlur}
            error={invalidPassword}  
            success={validPassword}  
            hint={passwordHint}   
            className="pr-12" 
          />
          <button
            type="button"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            onMouseDown={(e) => e.preventDefault()} // evita perder foco/blur
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-5 -translate-y-1/2 z-10
                      p-1.5 rounded-full border shadow-sm
                      bg-white text-gray-700 hover:text-gray-900
                      dark:bg-gray-800 dark:text-gray-200 dark:hover:text-white"
          >
            {showPassword ? (
              // 👁️‍🗨️ EyeOff (ocultar)
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3l18 18" />
                <path d="M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 5.52A10.94 10.94 0 0112 5c7 0 11 7 11 7a17.1 17.1 0 01-4.38 4.62" />
                <path d="M6.62 6.62A17.1 17.1 0 001 12s4 7 11 7a10.94 10.94 0 004.48-.9" />
              </svg>
            ) : (
              // 👁️ Eye (mostrar)
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
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
            onBlur={onBlur}
            error={invalidConfirm} 
            success={validConfirm}    
            hint={confirmHint}  
            className="pr-12"
          />
          <button
            type="button"
            aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-2 top-5 -translate-y-1/2 z-10
                      p-1.5 rounded-full border shadow-sm
                      bg-white text-gray-700 hover:text-gray-900
                      dark:bg-gray-800 dark:text-gray-200 dark:hover:text-white"
          >
            {showPassword ? (
              // 👁️‍🗨️ EyeOff (ocultar)
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3l18 18" />
                <path d="M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 5.52A10.94 10.94 0 0112 5c7 0 11 7 11 7a17.1 17.1 0 01-4.38 4.62" />
                <path d="M6.62 6.62A17.1 17.1 0 001 12s4 7 11 7a10.94 10.94 0 004.48-.9" />
              </svg>
            ) : (
              // 👁️ Eye (mostrar)
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}