import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from "../../icons";
import Label from "../form/Etiqueta";
import Input from "../form/input/CampoEntrada";
import Button from "../ui/button/Button";

export default function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [errorBanner, setErrorBanner] = useState("");
  const [successBanner, setSuccessBanner] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const navigate = useNavigate();

  const isValidEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const fieldStatus = () => {
    const wasTouched = touched || submitAttempted;
    if (!wasTouched) return { error: false, valid: false, message: undefined as string | undefined };
    const ok = isValidEmail(email);
    return {
      error: !ok,
      valid: ok,
      message: ok ? undefined : "Ingresa un correo electrónico válido (ej. usuario@dominio.com).",
    };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(/\s+/g, "").slice(0, 80);
    setEmail(sanitized);
    setTouched(true);
    setErrorBanner("");
    setSuccessBanner("");
  };

  const handleBlur = () => setTouched(true);

  const preventSpaceKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " ") e.preventDefault();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\s+/g, "");
    setEmail(text);
    setTouched(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner("");
    setSuccessBanner("");
    setSubmitAttempted(true);

    if (!email.trim()) {
      setErrorBanner("Por favor, ingresa tu correo electrónico.");
      return;
    }
    if (!isValidEmail(email)) {
      setErrorBanner("El correo electrónico no tiene un formato válido.");
      return;
    }

    // Éxito: muestra banner y luego navega a la verificación con el email
    setSuccessBanner("Te enviamos un código de verificación a tu correo.");
    setTimeout(() => {
      navigate("/verify-code", { state: { email } });
    }, 900);
  };

  const s = fieldStatus();

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

          {/* Banners */}
          {errorBanner && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700
                         dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200"
            >
              {errorBanner}
            </div>
          )}
          {successBanner && (
            <div
              role="status"
              aria-live="polite"
              className="mb-3 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700
                         dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-200"
            >
              {successBanner}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <Label>
                  Email <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="email"
                  name="email"
                  placeholder="info@gmail.com"
                  value={email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={preventSpaceKey}
                  onPaste={handlePaste}    
                  error={s.error}
                  success={s.valid}
                  hint={s.message}
                />
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
              Espera, recuerdo mi contraseña…{" "}
              <Link to="/signin" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
                Haz clic aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
