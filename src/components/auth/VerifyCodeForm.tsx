import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import Button from "../ui/button/Button";
import ResultModal from "../modals/ResultModal";
import { api } from "../../api";

type LocationState = {
  email?: string;
};

export default function VerifyCodeForm() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { email = "" } = (location.state as LocationState) || {};

  const [errorInline, setErrorInline] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [nextToken, setNextToken] = useState<string | null>(null);

  const digits = code.join("");
  const hasSome = digits.length > 0;
  const isComplete = digits.length === 6;

  // Enforce sequence: si no viene el correo desde /reset-password, regresar.
  useEffect(() => {
    if (!email) {
      navigate("/reset-password", { replace: true });
    }
  }, [email, navigate]);

  const focusAt = (i: number) => inputRefs.current[i]?.focus();

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(0, 1);
    if (!digit && value) return;

    setCode((prev) => {
      const next = [...prev];
      next[index] = digit ?? "";
      return next;
    });

    setErrorInline("");

    if (digit && index < 5) focusAt(index + 1);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Spacebar" || /^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault();
      return;
    }
    if (e.key === "Backspace" && !code[index] && index > 0) {
      e.preventDefault();
      setCode((prev) => {
        const next = [...prev];
        next[index - 1] = "";
        return next;
      });
      focusAt(index - 1);
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusAt(index - 1);
    }
    if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();

    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setCode(next);
    setErrorInline("");
    if (text.length < 6) focusAt(text.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInline("");
    setNextToken(null);

    if (!isComplete) {
      setErrorInline("Ingrese los 6 dígitos del código de verificación.");
      return;
    }

    const verificationCode = code.join("");

    setIsLoading(true);
    try {
      const data = await api("/recuperarPass/verificarCod", {
        method: "POST",
        body: {
          correo: email,
          codigo: verificationCode,
        },
      });

      setNextToken(data.tokenRecuperacion as string);
      setModalType("success");
      setModalTitle("Código verificado");
      setModalMessage(
        "El código de seguridad ha sido validado correctamente. Ahora puede definir una nueva contraseña."
      );
      setModalVisible(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo verificar el código de seguridad.";
      setModalType("error");
      setModalTitle("Error al verificar el código");
      setModalMessage(msg);
      setModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setIsLoading(true);
    try {
      await api("/recuperarPass/solicitar", {
        method: "POST",
        body: { correo: email },
      });
      setModalType("success");
      setModalTitle("Código reenviado");
      setModalMessage(
        "Se ha enviado un nuevo código de verificación al correo registrado."
      );
      setModalVisible(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo reenviar el código de verificación.";
      setModalType("error");
      setModalTitle("Error al reenviar el código");
      setModalMessage(msg);
      setModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    if (modalType === "success" && nextToken && email) {
      navigate("/new-password", {
        replace: true,
        state: { email, tokenRecuperacion: nextToken },
      });
    }
  };

  const baseBox =
    "w-12 h-12 sm:w-14 sm:h-14 text-xl font-semibold text-center rounded-lg " +
    "bg-white dark:bg-gray-800 text-gray-800 dark:text-white " +
    "border transition focus:outline-none focus:ring-2";
  const stateClass = isComplete
    ? "border-green-500 focus:ring-green-400"
    : hasSome
    ? "border-red-500 focus:ring-red-400"
    : "border-gray-300 dark:border-gray-700 focus:ring-brand-500 focus:border-brand-500";

  return (
    <>
      <div className="flex flex-col flex-1">
        <div className="w-full max-w-md pt-10 mx-auto">
          <Link
            to="/reset-password"
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
                Verificación de seguridad
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Se ha enviado un código de verificación a su correo electrónico.
                Ingréselo a continuación para continuar con el proceso de
                recuperación.
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
              <div className="space-y-6">
                <div>
                  <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Escriba el código de seguridad de 6 dígitos
                  </p>

                  <div className="flex gap-2 sm:gap-3">
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        className={`${baseBox} ${stateClass}`}
                        aria-label={`Dígito ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Button
                    {...({ type: "submit" } as any)}
                    className="w-full"
                    size="sm"
                    disabled={!isComplete || isLoading}
                  >
                    {isLoading ? "Verificando..." : "Verificar código"}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400">
                ¿No recibió el código?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  disabled={isLoading}
                >
                  Reenviar código
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

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
