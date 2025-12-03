import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiChevronLeft, FiEye, FiEyeOff } from "react-icons/fi";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import ConfirmModal from "../modals/ConfirmModal";
import ResultModal from "../modals/ResultModal";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import type { AuthUser, Rol } from "./authStorage";

type LocationState = {
  email?: string;
  tokenRecuperacion?: string;
};

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

export default function NewPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [touched, setTouched] = useState<{
    password?: boolean;
    confirmPassword?: boolean;
  }>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [errorInline, setErrorInline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmVisible, setConfirmVisible] = useState(false);

  const [resultVisible, setResultVisible] = useState(false);
  const [resultType, setResultType] = useState<"success" | "error">("success");
  const [resultTitle, setResultTitle] = useState("");
  const [resultMessage, setResultMessage] = useState("");
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { email, tokenRecuperacion } = (location.state as LocationState) || {};
  const { setSession } = useAuth();

  // Enforce sequence: requiere token de recuperación y correo
  useEffect(() => {
    if (!email || !tokenRecuperacion) {
      navigate("/reset-password", { replace: true });
    }
  }, [email, tokenRecuperacion, navigate]);

  const noSpaces = (s: string) => s.replace(/\s/g, "");
  const hasLower = (s: string) => /[a-z]/.test(s);
  const hasUpper = (s: string) => /[A-Z]/.test(s);
  const hasNumber = (s: string) => /\d/.test(s);
  const hasSymbol = (s: string) => /[^A-Za-z0-9]/.test(s);
  const noWhitespace = (s: string) => !/\s/.test(s);

  const passwordValid = (s: string) =>
    s.length >= 8 &&
    hasLower(s) &&
    hasUpper(s) &&
    hasNumber(s) &&
    hasSymbol(s) &&
    noWhitespace(s);

  const passwordStatus = (): {
    error: boolean;
    valid: boolean;
    message?: string;
  } => {
    const v = password;
    const show = !!touched.password || submitAttempted;
    if (!show) return { error: false, valid: false };

    const ok = passwordValid(v);
    let msg: string | undefined;
    if (!ok) {
      msg =
        "La contraseña debe tener al menos 8 caracteres e incluir mayúsculas, minúsculas, números y símbolos, sin espacios.";
    }
    return { error: !ok, valid: ok, message: msg };
  };

  const confirmStatus = (): {
    error: boolean;
    valid: boolean;
    message?: string;
  } => {
    const show = !!touched.confirmPassword || submitAttempted;
    if (!show) return { error: false, valid: false };
    if (!confirmPassword) {
      return {
        error: true,
        valid: false,
        message: "Ingrese nuevamente la contraseña para confirmarla.",
      };
    }
    const ok = confirmPassword === password && passwordValid(password);
    return {
      error: !ok,
      valid: ok,
      message: ok ? undefined : "Las contraseñas no coinciden.",
    };
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = noSpaces(e.target.value).slice(0, 64);
    setPassword(value);
    setTouched((prev) => ({ ...prev, password: true }));
    setErrorInline("");
  };

  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = noSpaces(e.target.value).slice(0, 64);
    setConfirmPassword(value);
    setTouched((prev) => ({ ...prev, confirmPassword: true }));
    setErrorInline("");
  };

  const preventSpaceKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " " || e.key === "Spacebar") e.preventDefault();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setErrorInline("");

    const p = passwordStatus();
    const c = confirmStatus();

    if (p.error || c.error) {
      setErrorInline("Por favor, corrija los campos resaltados antes de continuar.");
      return;
    }

    setConfirmVisible(true);
  };

  const handleConfirmReset = async () => {
    if (!tokenRecuperacion) {
      setConfirmVisible(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await api("/recuperarPass/resetear", {
        method: "POST",
        body: {
          tokenRecuperacion,
          nuevaContrasena: password,
          confirmarContrasena: confirmPassword,
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

      setResultType("success");
      setResultTitle("Contraseña actualizada");
      setResultMessage(
        "La contraseña se actualizó correctamente. La sesión se ha iniciado con sus nuevas credenciales."
      );
      setResultVisible(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo actualizar la contraseña.";
      setResultType("error");
      setResultTitle("Error al actualizar la contraseña");
      setResultMessage(msg);
      setResultVisible(true);
    } finally {
      setIsSubmitting(false);
      setConfirmVisible(false);
    }
  };

  const handleResultClose = () => {
    setResultVisible(false);
    if (resultType === "success" && redirectPath) {
      navigate(redirectPath, { replace: true });
    }
  };

  const pStat = passwordStatus();
  const cStat = confirmStatus();

  return (
    <>
      <div className="flex flex-col flex-1">
        <div className="w-full max-w-md pt-10 mx-auto">
          <Link
            to="/verify-code"
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <FiChevronLeft className="w-5 h-5" />
            Volver
          </Link>
        </div>

        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          <div>
            <div className="mb-5 sm:mb-8">
              <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                Definir nueva contraseña
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Su nueva contraseña debe cumplir con la política de seguridad
                establecida y será utilizada para iniciar sesión a partir de
                ahora.
              </p>
            </div>

            {errorInline && (
              <div
                role="alert"
                className="mb-4 flex items-center gap-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700
                           dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200"
              >
                {errorInline}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-7">
                <div>
                  <Label>
                    Nueva contraseña <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative h-11">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingrese su nueva contraseña"
                      value={password}
                      onChange={handlePasswordChange}
                      onKeyDown={preventSpaceKey}
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, password: true }))
                      }
                      error={pStat.error}
                      success={pStat.valid}
                      hint={pStat.message}
                      className="pr-12 h-11"
                      disabled={isSubmitting}
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
                        className="p-1.5 rounded-full border shadow-sm
                                  bg-white text-gray-700 hover:text-gray-900
                                  dark:bg-gray-800 dark:text-gray-200 dark:hover:text-white"
                        disabled={isSubmitting}
                      >
                        {showPassword ? (
                          <FiEyeOff className="w-4 h-4" />
                        ) : (
                          <FiEye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>
                    Confirmar contraseña{" "}
                    <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative h-11">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirme su nueva contraseña"
                      value={confirmPassword}
                      onChange={handleConfirmChange}
                      onKeyDown={preventSpaceKey}
                      onBlur={() =>
                        setTouched((prev) => ({
                          ...prev,
                          confirmPassword: true,
                        }))
                      }
                      error={cStat.error}
                      success={cStat.valid}
                      hint={cStat.message}
                      className="pr-12 h-11"
                      disabled={isSubmitting}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <button
                        type="button"
                        aria-label={
                          showConfirmPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="p-1.5 rounded-full border shadow-sm
                                  bg-white text-gray-700 hover:text-gray-900
                                  dark:bg-gray-800 dark:text-gray-200 dark:hover:text-white"
                        disabled={isSubmitting}
                      >
                        {showConfirmPassword ? (
                          <FiEyeOff className="w-4 h-4" />
                        ) : (
                          <FiEye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 sm:mt-8">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Button
                    {...({ type: "submit" } as any)}
                    className="w-full"
                    size="sm"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Actualizando contraseña..."
                      : "Guardar cambios"}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400">
                ¿Recordó su contraseña?{" "}
                <Link
                  to="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        visible={confirmVisible}
        title="Confirmar actualización de contraseña"
        message="¿Desea actualizar su contraseña y cerrar cualquier sesión previa activa?"
        onCancel={() => setConfirmVisible(false)}
        onConfirm={handleConfirmReset}
        confirmText="Sí, actualizar"
        cancelText="Cancelar"
        danger={false}
        loading={isSubmitting}
      />

      <ResultModal
        visible={resultVisible}
        type={resultType}
        title={resultTitle}
        message={resultMessage}
        onClose={handleResultClose}
      />
    </>
  );
}
