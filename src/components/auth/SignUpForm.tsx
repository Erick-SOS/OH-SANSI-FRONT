import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from "../../icons";
import { AuthContext, RegistroEvaluadorPayload } from "../../context/AuthContext";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import DocumentField from "../form/DocumentField";
import PasswordField from "../form/PasswordField";
import ErrorAlert from "../form/alerts/ErrorAlert";
import SubmitButton from "../ui/SubmitButton";
import usePasswordValidation from "../../hooks/usePasswordValidation";
import { CheckCircle } from "lucide-react";

export default function SignUpForm() {
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

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

  const { valid, match, passwordMessage } = usePasswordValidation(
    formData.password,
    formData.confirmPassword
  );

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

    if (
      !nombre ||
      !ap_paterno ||
      !ap_materno ||
      !correo ||
      !password ||
      !confirmPassword ||
      !telefono ||
      !tipo_documento ||
      !numero_documento
    ) {
      setError("Por favor, complete todos los campos obligatorios.");
      return;
    }

    if (!valid) {
      setError("La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas y minúsculas.");
      return;
    }

    if (!match) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!isChecked) {
      setError("Debe aceptar los términos y condiciones.");
      return;
    }

    setLoading(true);
    try {
      const payload: RegistroEvaluadorPayload = {
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
      };

      await register(payload);
      setSuccess("Registro exitoso. Redirigiendo al dashboard...");
      setTimeout(() => navigate("/dashboard"), 2000); // Redirige tras 2 segundos

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

        {error && <ErrorAlert message={error} />}
        {success && (
          <div className="mb-3 text-sm text-green-600 bg-green-100 p-2 rounded flex items-center gap-2" role="status">
            <CheckCircle className="w-5 h-5 text-green-600" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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

          <div>
            <Label>Correo electrónico <span className="text-red-500">*</span></Label>
            <Input type="email" name="correo" placeholder="ejemplo@gmail.com" value={formData.correo} onChange={handleChange} />
          </div>
          <div>
            <Label>Teléfono <span className="text-red-500">*</span></Label>
            <Input type="text" name="telefono" placeholder="Ej: 76543210" value={formData.telefono} onChange={handleChange} />
          </div>

          <DocumentField
            tipo_documento={formData.tipo_documento}
            numero_documento={formData.numero_documento}
            onChange={handleChange}
          />

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

          <PasswordField password={formData.password} confirmPassword={formData.confirmPassword} onChange={handleChange} />
          {passwordMessage && (
            <p className={`text-sm ${valid ? "text-green-600" : "text-red-500"}`}>{passwordMessage}</p>
          )}

          <div className="flex items-start gap-3">
            <Checkbox className="w-4 h-4 mt-1" checked={isChecked} onChange={(checked: boolean) => setIsChecked(checked)} />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Acepto los <span className="underline cursor-pointer text-gray-800 dark:text-white/90">Términos y Condiciones</span> y la{" "}
              <span className="underline cursor-pointer text-gray-800 dark:text-white/90">Política de Privacidad.</span>
            </p>
          </div>

          <SubmitButton loading={loading} text="Registrarte" loadingText="Registrando..." />
        </form>

        <div className="mt-5 text-center">
          <p className="text-sm text-gray-700 dark:text-gray-400">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/signin" className="text-blue-600 hover:text-blue-700">
              Inicia Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}