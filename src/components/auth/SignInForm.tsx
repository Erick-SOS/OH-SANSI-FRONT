import { useState } from "react";
import { Link } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";

interface User {
  name: string;
  role: string;
}

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(null);

  // Función de validación de contraseña segura
  const isPasswordValid = (pass: string) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;
    return regex.test(pass);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setUser(null);

    if (!email || !password) {
      setError("Por favor, complete todos los campos.");
      return;
    }

    if (!isPasswordValid(password)) {
      setError(
        "La contraseña debe tener mínimo 8 caracteres, incluir letras, números y símbolos."
      );
      return;
    }

    // Simulación de autenticación
    if (email === "admin@gmail.com" && password === "Admin@123") {
      setUser({ name: "Administrador", role: "Admin" });
    } else {
      setError("Correo o contraseña incorrectos ");
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
          Back to dashboard
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Sign In
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ingresa tu correo y contraseña para acceder
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div>
              <Label>Email <span className="text-error-500">*</span></Label>
              <Input
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                placeholder="info@gmail.com"
              />
            </div>

            <div>
              <Label>Password <span className="text-error-500">*</span></Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Ingresa tu contraseña"
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

            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Solo link de "Forgot password?" */}
            <div className="flex justify-end">
              <Link
                to="/reset-password"
                className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Forgot password?
              </Link>
            </div>

            {/* Botón de submit nativo */}
            <button
              type="submit"
              className="w-full px-4 py-3 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-600"
            >
              Sign in
            </button>
          </form>

          {/* Mostrar usuario y rol al iniciar sesión */}
          {user && (
            <div className="mt-4 p-3 bg-green-100 rounded text-green-700">
              Bienvenido, {user.name}! Rol: {user.role}
            </div>
          )}

          <div className="mt-5 text-sm text-center text-gray-700 dark:text-gray-400">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
