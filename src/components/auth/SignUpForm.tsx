import { useState } from "react";
import { Link } from "react-router-dom";
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
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    ap_paterno: "",
    ap_materno: "",
    correo: "",
    password: "",
    confirmPassword: "",
    telefono: "",
    tipo_documento: "CI",
    numero_documento: "",
    profesion: "",
    institucion: "",
    cargo: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (["nombre", "ap_paterno", "ap_materno", "profesion", "cargo"].includes(name)) {
      newValue = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúñÑ\s]/g, "");
    }

    if (["telefono"].includes(name)) {
      newValue = value.replace(/[^0-9]/g, "");
    }

    if (["numero_documento"].includes(name)) {
      newValue = value.replace(/[^0-9-]/g, "");
    }
    setFormData({ ...formData, [name]: newValue });
  };

  // Función auxiliar para manejar errores
  const getErrorMessage = (err: unknown) => {
    if (err instanceof Error) return err.message;
    return String(err);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const {
      nombre,
      ap_paterno,
      ap_materno,
      correo,
      password,
      confirmPassword,
      telefono,
      tipo_documento,
      numero_documento,
      profesion,
      institucion,
      cargo,
    } = formData;

    // Validaciones
    if (!nombre || !ap_paterno || !ap_materno || !correo || !password || !confirmPassword || !telefono || !tipo_documento || !numero_documento) {
      setError("Por favor, complete todos los campos obligatorios.");
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password)) {
      setError("La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas y minúsculas.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!isChecked) {
      setError("Debe aceptar los términos y condiciones.");
      return;
    }

    // Envío al backend
    setLoading(true);
    try {
      const response = await fetch("https://back-oh-sansi.vercel.app/api/evaluadores/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          ap_paterno,
          ap_materno,
          correo,
          password,
          confirmPassword,
          telefono,
          tipo_documento,
          numero_documento,
          profesion,
          institucion,
          cargo,
          aceptaTerminos: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Error al registrar el evaluador.");

      setSuccess("Registro exitoso. Tu cuenta será revisada por un administrador.");
      setFormData({
        nombre: "",
        ap_paterno: "",
        ap_materno: "",
        correo: "",
        password: "",
        confirmPassword: "",
        telefono: "",
        tipo_documento: "CI",
        numero_documento: "",
        profesion: "",
        institucion: "",
        cargo: "",
      });
      setIsChecked(false);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          <ChevronLeftIcon className="size-5" />
          Volver
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Regístrate como Evaluador
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ingresa tus datos para registrarte y espera a que un administrador te designe un área.
          </p>
        </div>

        {error && <p className="mb-3 text-sm text-red-500 bg-red-100 p-2 rounded flex items-center gap-2"><AlertCircle className="w-5 h-5 text-red-600"/>{error}</p>}
        {success && <p className="mb-3 text-sm text-green-600 bg-green-100 p-2 rounded flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-600"/>{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre y Apellidos */}
          <div>
            <Label>Nombre <span className="text-red-500">*</span></Label>
            <Input type="text" name="nombre" placeholder="Ingrese su nombre" value={formData.nombre} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label>Apellido Paterno <span className="text-red-500">*</span></Label>
              <Input type="text" name="ap_paterno" placeholder="Apellido paterno" value={formData.ap_paterno} onChange={handleChange} />
            </div>
            <div>
              <Label>Apellido Materno <span className="text-red-500">*</span></Label>
              <Input type="text" name="ap_materno" placeholder="Apellido materno" value={formData.ap_materno} onChange={handleChange} />
            </div>
          </div>

          {/* Correo */}
          <div>
            <Label>Correo electrónico <span className="text-red-500">*</span></Label>
            <Input type="email" name="correo" placeholder="ejemplo@gmail.com" value={formData.correo} onChange={handleChange} />
          </div>

          {/* Teléfono y Tipo de Documento */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label>Teléfono <span className="text-red-500">*</span></Label>
              <Input type="text" name="telefono" placeholder="Ej: 76543210" value={formData.telefono} onChange={handleChange} />
            </div>
            <div>
              <Label>Tipo de Documento <span className="text-red-500">*</span></Label>
              <select
                name="tipo_documento"
                value={formData.tipo_documento}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 text-gray-700"
              >
                <option value="CI">CI - Cédula de Identidad</option>
                <option value="Pasaporte">Pasaporte</option>
              </select>
            </div>
          </div>

          {/* Número de Documento */}
          <div>
            <Label>Número de Documento <span className="text-red-500">*</span></Label>
            <Input type="text" name="numero_documento" placeholder="1234567" value={formData.numero_documento} onChange={handleChange} />
          </div>

          {/* Profesión, Institución/Unidad y Cargo */}
          <div>
            <Label>Profesión</Label>
            <Input type="text" name="profesion" placeholder="Ej: Ingeniero Civil" value={formData.profesion} onChange={handleChange} />
          </div>
          <div>
            <Label>Institución / Unidad</Label>
            <Input type="text" name="institucion" placeholder="Ej: UMSS" value={formData.institucion} onChange={handleChange} />
          </div>
          <div>
            <Label>Cargo</Label>
            <Input type="text" name="cargo" placeholder="Ej: Docente" value={formData.cargo} onChange={handleChange} />
          </div>

          {/* Contraseña */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label>Contraseña <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} name="password" placeholder="Ingresa tu contraseña" value={formData.password} onChange={handleChange} />
                <span onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer">
                  {showPassword ? <EyeIcon className="size-5"/> : <EyeCloseIcon className="size-5"/>}
                </span>
              </div>
            </div>
            <div>
              <Label>Confirmar Contraseña <span className="text-red-500">*</span></Label>
              <Input type="password" name="confirmPassword" placeholder="Repite tu contraseña" value={formData.confirmPassword} onChange={handleChange} />
            </div>
          </div>

          {/* Checkbox */}
          <div className="flex items-start gap-3">
            <Checkbox className="w-4 h-4 mt-1" checked={isChecked} onChange={(checked: boolean) => setIsChecked(checked)} />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Acepto los <span className="underline cursor-pointer text-gray-800 dark:text-white/90">Términos y Condiciones</span> y la <span className="underline cursor-pointer text-gray-800 dark:text-white/90">Política de Privacidad.</span>
            </p>
          </div>

          {/* Botón */}
          <div>
            <button type="submit" disabled={loading} className={`flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white rounded-lg transition ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}>
              {loading ? "Registrando..." : "Registrarte"}
            </button>
          </div>
        </form>

        <div className="mt-5 text-center">
          <p className="text-sm text-gray-700 dark:text-gray-400">
            ¿Ya tienes una cuenta? <Link to="/signin" className="text-blue-600 hover:text-blue-700">Inicia Sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
