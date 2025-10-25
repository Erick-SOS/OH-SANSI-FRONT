import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import { ChevronLeftIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";

export default function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email) {
      setError("Por favor ingresa tu correo electrónico");
      return;
    }
    
    if (!validateEmail(email)) {
      setError("Por favor ingresa un correo electrónico válido");
      return;
    }
    
    console.log("Solicitud de restablecimiento enviada para:", email);
    
    navigate("/verify-code", { state: { email } });
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/signin"
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
              ¿Olvidaste tu contraseña?
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Introduce la dirección de correo electrónico vinculada a tu cuenta y te enviaremos un enlace para restablecer tu contraseña.
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <Label>
                  Email <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="info@gmail.com"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                />
                {error && (
                  <p className="mt-2 text-sm text-error-500">
                    {error}
                  </p>
                )}
              </div>
              <div>
                <Button 
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({ type: "submit" } as any)}
                  className="w-full" 
                  size="sm"
                >
                  Enviar enlace de reinicio
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400">
              Espera, recuerdo mi contraseña...{" "}
              <Link
                to="/signin"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Haz clic aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}