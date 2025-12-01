// src/components/auth/SignInForm.tsx
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from "../../icons";
import { AuthContext } from "../../context/AuthContext";
import Label from "../form/Label";
import Input from "../form/input/InputField";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  type Campo = "correo" | "password";
  const [touched, setTouched] = useState<Record<Campo, boolean>>({
    correo: false,
    password: false,
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as Campo;
    const raw = e.target.value;
    if (name === "correo") {
      const clean = raw.replace(/\s+/g, "").slice(0, 80);
      setEmail(clean);
    } else if (name === "password") {
      const clean = raw.replace(/\s/g, "").slice(0, 30);
      setPassword(clean);
    }
    setTouched((prev) => ({ ...prev, [name]: true }));
    setError("");
    setSuccess("");
  };

  const fieldStatus = (
    name: "correo" | "password"
  ): { error: boolean; valid: boolean; message?: string } => {
    const v = name === "correo" ? email.trim() : password.trim();
    const wasTouched = !!touched[name] || submitAttempted;
    if (!wasTouched) return { error: false, valid: false };

    if (name === "correo") {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      return {
        error: !ok,
        valid: ok,
        message: ok ? undefined : "Ingrese un correo válido (ej: usuario@dominio.com).",
      };
    }

    const length = v.length >= 8;
    const lower = /[a-z]/.test(v);
    const upper = /[A-Z]/.test(v);
    const ok = length && lower && upper;
    let message: string | undefined;
    if (!ok) {
      if (!length) message = "La contraseña debe tener al menos 8 caracteres.";
      else if (!lower || !upper) message = "Debe incluir mayúsculas y minúsculas.";
    }
    return { error: !ok, valid: ok, message };
  };

  const preventSpaceKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " ") e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const emailTrim = email.trim().toLowerCase();
    const passwordTrim = password.trim();

    // Validación de formato
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim);
    const passOk =
      passwordTrim.length >= 8 &&
      /[a-z]/.test(passwordTrim) &&
      /[A-Z]/.test(passwordTrim);

    if (!emailOk || !passOk) {
      setTouched({ correo: true, password: true });
      setSubmitAttempted(true);
      setError("Por favor, completa todos los campos correctamente.");
      setIsLoading(false);
      return;
    }

    try {
      // USUARIOS HARDCODEADOS
      if (emailTrim === "admin@gmail.com" && passwordTrim === "12345678La#") {
        await login(emailTrim, passwordTrim, {
          name: "Administrador",
          rol: "administrador",
        });
        setSuccess("¡Bienvenido Administrador!");
        setTimeout(() => navigate("/dashboard-admin"), 1200);
        return;
      }

      if (emailTrim === "evaluador@gmail.com" && passwordTrim === "12345678La#") {
        await login(emailTrim, passwordTrim, {
          name: "Evaluador",
          rol: "EVALUADOR",
        });
        setSuccess("¡Bienvenido Evaluador!");
        setTimeout(() => navigate("/evaluador/dashboard"), 1200);
        return;
      }

      if (emailTrim === "responsable@gmail.com" && passwordTrim === "12345678La#") {
        await login(emailTrim, passwordTrim, {
          name: "Responsable",
          rol: "RESPONSABLE",
        });
        setSuccess("¡Bienvenido Responsable!");
        setTimeout(() => navigate("/dashboard-responsable"), 1200);
        return;
      }

      setError("Correo o contraseña incorrectos");
      setIsLoading(false);
    } catch {
      setError("Error al iniciar sesión. Por favor, intenta de nuevo.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Volver
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Inicia sesión
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ¡Introduce tu correo y contraseña para continuar!
          </p>

          {/* MENSAJES */}
          {error && (
            <div
              role="alert"
              className="mt-3 mb-3 flex items-center gap-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-500"
            >
              {error}
            </div>
          )}
          {success && (
            <div
              role="status"
              className="mt-3 mb-3 flex items-center gap-2 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700"
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* CORREO */}
            {(() => {
              const s = fieldStatus("correo");
              return (
                <div>
                  <Label>
                    Correo <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    data-testid="input-email"
                    type="email"
                    name="correo"
                    value={email}
                    placeholder="info@gmail.com"
                    onKeyDown={preventSpaceKey}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={s.error}
                    success={s.valid}
                    hint={s.message}
                  />
                </div>
              );
            })()}

            {/* CONTRASEÑA */}
            {(() => {
              const s = fieldStatus("password");
              return (
                <div>
                  <Label>
                    Contraseña <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative h-11">
                    <Input
                      data-testid="input-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={password}
                      placeholder="Ingresa tu contraseña"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={s.error}
                      success={s.valid}
                      className="pr-12 h-11"
                    />

                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <button
                        type="button"
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1.5 rounded-full border shadow-sm bg-white text-gray-700"
                      >
                        {/* Iconos */}
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-end">
              <Link to="/reset-password" className="text-sm text-brand-500">
                ¿Has olvidado tu contraseña?
              </Link>
            </div>

            <button
              data-testid="btn-login"
              type="submit"
              disabled={isLoading}
              className={`w-full px-4 py-3 text-sm font-medium text-white rounded-lg transition-all ${isLoading
                ? "bg-brand-400 cursor-not-allowed"
                : "bg-brand-500 hover:bg-brand-600"
                }`}
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>

          <div className="mt-5 text-sm text-center text-gray-700">
            ¿No tienes una cuenta?{" "}
            <Link to="/signup" className="text-brand-500 hover:text-brand-600">
              Regístrate
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
