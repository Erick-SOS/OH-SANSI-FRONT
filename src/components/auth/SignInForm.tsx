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

  setTouched(prev => ({ ...prev, [name]: true }));
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
        message: ok ? undefined : "Ingrese el correo que uso para su registró con formato valido.",
      };
    }

    const length = v.length >= 8;
    const lower = /[a-z]/.test(v);
    const upper = /[A-Z]/.test(v);
    const ok = length && lower && upper;
    let message: string | undefined;
    if (!ok) {
      if (!length) message = "Ingrese la contraseña que definió en su registro.";
      else if (!lower || !upper) message = "Ingrese su contraseña con formato invalido";
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

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const passVal = password.trim();
    const passOk =
      passVal.length >= 8 && /[a-z]/.test(passVal) && /[A-Z]/.test(passVal);

    if (!emailOk || !passOk) {
      setTouched({ correo: true, password: true });
      setSubmitAttempted(true);
      setError(
        "Por favor, complete los campos obligatorios"
      );
      return;
    }

    try {
      if (email === "admin@gmail.com" && password === "12345678La#") {
        await login(email, password, { name: "Administrador", rol: "administrador" });
        setSuccess("Inicio de sesión correcto. Redirigiendo…");
        setTimeout(() => navigate("/dashboard"), 1200);
      } else if (email === "evaluador@gmail.com" && password === "12345678La#") {
        await login(email, password, { name: "Evaluador", rol: "EVALUADOR" });
        setSuccess("Inicio de sesión correcto. Redirigiendo…");
        setTimeout(() => navigate("/dashboard"), 1200);
      } else if (email === "responsable@gmail.com" && password === "12345678La#") {
        await login(email, password, { name: "Responsable", rol: "RESPONSABLE" });
        setSuccess("Inicio de sesión correcto. Redirigiendo…");
        setTimeout(() => navigate("/dashboard"), 1200);
      } else {
        setError("Correo o contraseña incorrectos");
      }
    } catch {
      setError("Error al iniciar sesión. Por favor, intenta de nuevo.");
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
            ¡Introduce tu correo y contraseña para iniciar sesión!
          </p>

          {/* BANNERS */}
          {error && (
            <div
              role="alert"
              className="mt-3 mb-3 flex items-center gap-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-500
                         dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200"
            >
              {error}
            </div>
          )}
          {success && (
            <div
              role="status"
              className="mt-3 mb-3 flex items-center gap-2 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700
                         dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-200"
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {(() => {
              const s = fieldStatus("correo");
              return (
                <div>
                  <Label>
                    Correo <span className="text-error-500">*</span>
                  </Label>
                  <Input
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

            {(() => {
              const s = fieldStatus("password");
              return (
                <div>
                  <Label>
                    Contraseña <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative h-11">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={password}
                      placeholder="Ingresa tu contraseña"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={s.error}
                      success={s.valid}
                      hint={undefined}
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
                          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 3l18 18" />
                            <path d="M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 5.52A10.94 10.94 0 0112 5c7 0 11 7 11 7a17.1 17.1 0 01-4.38 4.62" />
                            <path d="M6.62 6.62A17.1 17.1 0 001 12s4 7 11 7a10.94 10.94 0 004.48-.9" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  {s.message && (
                    <p className="mt-1 text-xs text-red-500">
                      {s.message}
                    </p>
                  )}
                </div>
              );
            })()}


            <div className="flex justify-end">
              <Link
                to="/reset-password"
                className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                ¿Has olvidado tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-3 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-600"
            >
              Iniciar sesión
            </button>
          </form>

          <div className="mt-5 text-sm text-center text-gray-700 dark:text-gray-400">
            ¿No tienes una cuenta?{" "}
            <Link to="/signup" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
              Registrate
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
