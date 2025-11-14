import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Etiqueta";
import Input from "../form/input/CampoEntrada";
import Button from "../ui/button/Button";

export default function NewPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [touched, setTouched] = useState<{ password?: boolean; confirmPassword?: boolean }>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  // --- utilidades ---
  const noSpaces = (s: string) => s.replace(/\s/g, "");
  const hasLower = (s: string) => /[a-z]/.test(s);
  const hasUpper = (s: string) => /[A-Z]/.test(s);
  const minLen  = (s: string) => s.length >= 8;
  const passwordValid = (s: string) => minLen(s) && hasLower(s) && hasUpper(s);

  const passwordStatus = (): { error: boolean; valid: boolean; message?: string } => {
    const v = password.trim();
    const show = !!touched.password || submitAttempted;
    if (!show) return { error: false, valid: false };

    const ok = passwordValid(v);
    let msg: string | undefined;
    if (!ok) {
      if (!minLen(v)) msg = "Ingrese su contraseña. De 8 a 20 caracteres.";
      else if (!hasLower(v) || !hasUpper(v)) msg = "Use mayúsculas y minúsculas en su contraseña.";
      else msg = "Formato inválido.";
    }
    return { error: !ok, valid: ok, message: msg };
  };

  const confirmStatus = (): { error: boolean; valid: boolean; message?: string } => {
    const show = !!touched.confirmPassword || submitAttempted;
    if (!show) return { error: false, valid: false };
    if (!confirmPassword) return { error: true, valid: false, message: "Ingrese la misma contraseña para confirmarla" };
    const ok = confirmPassword === password && passwordValid(password);
    return { error: !ok, valid: ok, message: ok ? undefined : "Las contraseñas no coinciden." };
  };

  // --- handlers ---
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = noSpaces(e.target.value).slice(0, 30);
    setPassword(value);
    setTouched(prev => ({ ...prev, password: true }));
    setError(""); setSuccess("");
  };

  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = noSpaces(e.target.value).slice(0, 30);
    setConfirmPassword(value);
    setTouched(prev => ({ ...prev, confirmPassword: true }));
    setError(""); setSuccess("");
  };

  const preventSpaceKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " " || e.key === "Spacebar") e.preventDefault();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setError(""); setSuccess("");

    const p = passwordStatus();
    const c = confirmStatus();

    if (p.error || c.error) {
      setError("Por favor corrige los campos resaltados.");
      return;
    }

    setSuccess("Restableciendo contraseña y redirigiendo al inicio de sesión…");
    setTimeout(() => navigate("/signin"), 1200);
  };

  const pStat = passwordStatus();
  const cStat = confirmStatus();

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/verify-code"
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
              Ingresar nueva contraseña
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tu nueva contraseña debe ser diferente a las contraseñas utilizadas anteriormente.
            </p>
          </div>

          {/* Banners */}
          {error && (
            <div
              role="alert"
              className="mb-4 flex items-center gap-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700
                         dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200"
            >
              {error}
            </div>
          )}
          {success && (
            <div
              role="status"
              className="mb-4 flex items-center gap-2 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700
                         dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-200"
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-7">
              {/* Password */}
              <div>
                <Label>
                  Nueva Contraseña <span className="text-error-500">*</span>
                </Label>
                <div className="relative h-11">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={handlePasswordChange}
                    onKeyDown={preventSpaceKey}
                    onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                    error={pStat.error}
                    success={pStat.valid}
                    hint={pStat.message}
                    className="pr-12 h-11"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <button
                      type="button"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 rounded-full border shadow-sm
                                bg-white text-gray-700 hover:text-gray-900
                                dark:bg-gray-800 dark:text-gray-200 dark:hover:text-white"
                    >
                      {showPassword ? (
                        <EyeIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <Label>
                  Confirmar Contraseña <span className="text-error-500">*</span>
                </Label>
                <div className="relative h-11">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirma tu contraseña"
                    value={confirmPassword}
                    onChange={handleConfirmChange}
                    onKeyDown={preventSpaceKey}
                    onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
                    error={cStat.error}
                    success={cStat.valid}
                    hint={cStat.message}
                    className="pr-12 h-11"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <button
                      type="button"
                      aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="p-1.5 rounded-full border shadow-sm
                                bg-white text-gray-700 hover:text-gray-900
                                dark:bg-gray-800 dark:text-gray-200 dark:hover:text-white"
                    >
                      {showConfirmPassword ? (
                        <EyeIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Botón con más margen arriba */}
              <div className="mt-6 sm:mt-8">
                <Button
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({ type: "submit" } as any)}
                  className="w-full"
                  size="sm"
                >
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400">
              Espera, recuerdo mi contraseña…{" "}
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
