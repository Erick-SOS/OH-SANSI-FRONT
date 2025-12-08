import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import ResultModal from "../modals/ResultModal";
import { api } from "../../api";

export default function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [goToVerify, setGoToVerify] = useState(false);

  const navigate = useNavigate();

  const isValidEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const fieldStatus = () => {
    const wasTouched = touched || submitAttempted;
    if (!wasTouched)
      return {
        error: false,
        valid: false,
        message: undefined as string | undefined,
      };
    const ok = isValidEmail(email);
    return {
      error: !ok,
      valid: ok,
      message: ok
        ? undefined
        : "Ingrese un correo electrónico válido (ej. usuario@dominio.com).",
    };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(/\s+/g, "").slice(0, 80);
    setEmail(sanitized);
    setTouched(true);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setGoToVerify(false);

    const correo = email.trim().toLowerCase();

    if (!correo) {
      setModalType("error");
      setModalTitle("Correo requerido");
      setModalMessage("Por favor, ingrese su correo electrónico.");
      setModalVisible(true);
      return;
    }

    if (!isValidEmail(correo)) {
      setModalType("error");
      setModalTitle("Formato inválido");
      setModalMessage("El correo electrónico no tiene un formato válido.");
      setModalVisible(true);
      return;
    }

    setIsLoading(true);

    try {
      await api("/recuperarPass/solicitar", {
        method: "POST",
        body: { correo },
      });

      setModalType("success");
      setModalTitle("Solicitud registrada");
      setModalMessage(
        "Si el correo está registrado y activo, se ha enviado un código de verificación a su bandeja de entrada."
      );
      setGoToVerify(true);
      setModalVisible(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo procesar la solicitud de recuperación.";
      setModalType("error");
      setModalTitle("Error en la solicitud");
      setModalMessage(msg);
      setModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    if (modalType === "success" && goToVerify) {
      navigate("/verify-code", { state: { email: email.trim().toLowerCase() } });
    }
  };

  const s = fieldStatus();

  return (
    <>
      <div className="flex flex-col flex-1">
        <div className="w-full max-w-md pt-10 mx-auto">
          <Link
            to="/signin"
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
                ¿Olvidó su contraseña?
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Introduzca la dirección de correo electrónico vinculada a su
                cuenta. Le enviaremos un código de verificación para
                restablecer la contraseña.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Correo electrónico <span className="text-error-500">*</span>
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
                    disabled={isLoading}
                  />
                </div>

                <div>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Button
                    {...({ type: "submit" } as any)}
                    className="w-full"
                    size="sm"
                    disabled={isLoading}
                  >
                    {isLoading ? "Enviando solicitud..." : "Enviar código"}
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
