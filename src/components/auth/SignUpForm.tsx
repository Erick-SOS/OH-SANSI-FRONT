import { useState } from "react";
import { Link } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const fname = formData.get("fname") as string;
    const lname = formData.get("lname") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!fname || !lname || !email || !password) {
      setError("Por favor, complete todos los campos obligatorios.");
      return;
    }

    if (!isChecked) {
      setError("Debe aceptar los términos y condiciones.");
      return;
    }

    // Simulación de éxito
    setTimeout(() => {
      setSuccess("Registro exitoso. Revisa tu correo de confirmación.");
      form.reset();
      setIsChecked(false);
    }, 500);
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
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
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Regístrate como Evaluador
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ingresa tus datos para registrarte y espera a que un administrador te
              designe un área.
            </p>
          </div>

          {/* Mensajes arriba */}
          {error && (
            <p className="mb-3 text-sm text-red-500 bg-red-100 p-2 rounded flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              {error}
            </p>
          )}
          {success && (
            <p className="mb-3 text-sm text-green-600 bg-green-100 p-2 rounded flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              {success}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Nombre */}
                <div className="sm:col-span-1">
                  <Label>
                    Nombre <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="fname"
                    name="fname"
                    placeholder="Ingrese sus nombres"
                  />
                </div>

                {/* Apellidos */}
                <div className="sm:col-span-1">
                  <Label>
                    Apellidos <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="lname"
                    name="lname"
                    placeholder="Ingrese sus apellidos"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <Label>
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="info@gmail.com"
                />
              </div>

              {/* Contraseña */}
              <div>
                <Label>
                  Contraseña <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    placeholder="Ingresa tu contraseña"
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    )}
                  </span>
                </div>
              </div>

              {/* Checkbox */}
              <div className="flex items-start gap-3">
                <Checkbox
                  className="w-4 h-4 mt-1"
                  checked={isChecked}
                  onChange={(checked: boolean) => setIsChecked(checked)}
                />
                <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  Al crear una cuenta, aceptas los{" "}
                  <span className="text-gray-800 dark:text-white/90 underline cursor-pointer">
                    Términos, Condiciones
                  </span>{" "}
                  y nuestra{" "}
                  <span className="text-gray-800 dark:text-white underline cursor-pointer">
                    Política de Privacidad.
                  </span>
                </p>
              </div>

              {/* Botón */}
              <div>
                <button
                  type="submit"
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-blue-600 hover:bg-blue-700"
                >
                  Registrarte
                </button>
              </div>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400">
              ¿Ya tienes una cuenta?{" "}
              <Link to="/signin" className="text-blue-600 hover:text-blue-700">
                Inicia Sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}