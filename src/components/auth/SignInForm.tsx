// src/components/auth/SignInForm.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import ResultModal from "../modals/ResultModal";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import type { AuthUser, Rol } from "./authStorage";
import { Eye, EyeOff } from "lucide-react";

type Campo = "correo" | "password";

type TokenPayloadLike = {
  idUser?: number;
  jti?: string;
  nombreCompleto?: string;
  rol?: Rol;
  correo?: string;
  exp?: number;
  iat?: number;
};

function decodeTokenPayload(token: string): TokenPayloadLike | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = atob(base64);
    const data = JSON.parse(jsonStr);
    return data as TokenPayloadLike;
  } catch {
    return null;
  }
}

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [touched, setTouched] = useState<Record<Campo, boolean>>({
    correo: false,
    password: false,
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  const navigate = useNavigate();
  const { setSession } = useAuth();

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
        message: ok
          ? undefined
          : "Ingrese un correo válido (ej: usuario@dominio.com).",
      };
    }

    const length = v.length >= 8;
    const lower = /[a-z]/.test(v);
    const upper = /[A-Z]/.test(v);
    const ok = length && lower && upper;

    let message: string | undefined;
    if (!ok) {
      if (!length) message = "La contraseña debe tener al menos 8 caracteres.";
      else if (!lower || !upper)
        message = "Debe incluir mayúsculas y minúsculas.";
    }

    return { error: !ok, valid: ok, message };
  };

  const preventSpaceKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " ") e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitAttempted(true);
    setRedirectPath(null);

    const emailTrim = email.trim().toLowerCase();
    const passwordTrim = password.trim();

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim);
    const passOk =
      passwordTrim.length >= 8 &&
      /[a-z]/.test(passwordTrim) &&
      /[A-Z]/.test(passwordTrim);

    if (!emailOk || !passOk) {
      setTouched({ correo: true, password: true });
      setError("Por favor, complete todos los campos correctamente.");
      return;
    }

    setIsLoading(true);

    try {
      // Llamada real al backend
      const data = await api("/auth/login", {
        method: "POST",
        body: {
          correo: emailTrim,
          contrasena: passwordTrim,
        },
      });

      const token: string = data.token;
      const backendUser = data.user as {
        id: number;
        nombreCompleto: string;
        rol: Rol;
        correo: string;
      };

      const payload = decodeTokenPayload(token);

      const userForStorage: AuthUser = {
        idUser: payload?.idUser ?? backendUser.id,
        jti: payload?.jti ?? `${backendUser.id}-${Date.now()}`,
        nombreCompleto: payload?.nombreCompleto ?? backendUser.nombreCompleto,
        rol: payload?.rol ?? backendUser.rol,
        correo: payload?.correo ?? backendUser.correo,
      };

      await setSession(token, userForStorage);

      // Ruta según rol
      let target = "/";
      switch (userForStorage.rol) {
        case "ADMINISTRADOR":
          target = "/dashboard-admin";
          break;
        case "RESPONSABLE":
          target = "/dashboard-responsable";
          break;
        case "EVALUADOR":
          target = "/evaluador/dashboard";
          break;
      }
      setRedirectPath(target);

      setModalType("success");
      setModalTitle("Inicio de sesión exitoso");
      setModalMessage(`Bienvenido/a ${userForStorage.nombreCompleto}.`);
      setModalVisible(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Ocurrió un error al iniciar sesión.";
      setError(msg);
      setModalType("error");
      setModalTitle("Error al iniciar sesión");
      setModalMessage(msg);
      setModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    if (modalType === "success" && redirectPath) {
      navigate(redirectPath, { replace: true });
    }
  };

  return (
    <>
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
              Introduzca su correo y contraseña para continuar.
            </p>

            {error && (
              <div
                role="alert"
                className="mt-3 mb-3 flex items-center gap-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-500"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              {/* Correo */}
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
                      disabled={isLoading}
                    />
                  </div>
                );
              })()}

              {/* Contraseña */}
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
                        placeholder="Ingrese su contraseña"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={s.error}
                        success={s.valid}
                        className="pr-12 h-11"
                        disabled={isLoading}
                      />

                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <button
                          type="button"
                          aria-label={
                            showPassword
                              ? "Ocultar contraseña"
                              : "Mostrar contraseña"
                          }
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-1.5 rounded-full border shadow-sm bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end">
                <Link
                  to="/reset-password"
                  className="text-sm text-brand-500"
                >
                  ¿Ha olvidado su contraseña?
                </Link>
              </div>

              <button
                data-testid="btn-login"
                type="submit"
                disabled={isLoading}
                className={`w-full px-4 py-3 text-sm font-medium text-white rounded-lg transition-all ${
                  isLoading
                    ? "bg-brand-400 cursor-not-allowed"
                    : "bg-brand-500 hover:bg-brand-600"
                }`}
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
              </button>
            </form>

            <div className="mt-5 text-sm text-center text-gray-700">
              ¿No tiene una cuenta?{" "}
              <Link
                to="/signup"
                className="text-brand-500 hover:text-brand-600"
              >
                Regístrese
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de resultado (éxito / error) */}
      <ResultModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={handleModalClose}
      />
    </>
  );
}
