import { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ChevronLeftIcon } from "../../icons";
import Button from "../ui/button/Button";

export default function VerifyCodeForm() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const verificationCode = code.join("");
    console.log("Código ingresado:", verificationCode);
    
    navigate("/new-password");
  };

  const handleResend = () => {
    
    console.log("Reenviando código a:", email);
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/reset-password"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Volver
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Verificación de dos pasos
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Se ha enviado un código de verificación a tu correo. Introdúcelo en el campo de abajo.
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Escribe tu código de seguridad de 6 dígitos
                </p>
                <div className="flex gap-2 sm:gap-3">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-xl font-semibold text-center text-gray-800 transition-colors bg-white border border-gray-300 rounded-lg sm:w-14 sm:h-14 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                  ))}
                </div>
              </div>
              <div>
                <Button 
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({ type: "submit" } as any)}
                  className="w-full" 
                  size="sm"
                >
                  Verificar mi cuenta
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400">
              ¿No recibiste el código?{" "}
              <button
                type="button"
                onClick={handleResend}
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Reenviar
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}