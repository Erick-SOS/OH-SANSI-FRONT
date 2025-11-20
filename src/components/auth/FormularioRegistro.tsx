import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from "../../icons";
import { AuthContext, RegistroEvaluadorPayload } from "../../context/AuthContext";
import Label from "../form/Etiqueta";
import Input from "../form/input/CampoEntrada";
import Checkbox from "../form/input/Checkbox";
import DocumentField from "../form/CampoDocumento";
import PasswordField from "../form/CampoContraseña";
import ErrorAlert from "../form/alertas/ErrorAlert";
import SubmitButton from "../ui/SubmitButton";
import usePasswordValidation from "../../hooks/usePasswordValidation";
import { CheckCircle } from "lucide-react";

export default function SignUpForm() {
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
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
    complemento_documento: "", 
    profesion: "",
    institucion: "",
    cargo: "",
  });
  
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const { valid, match, passwordMessage, confirmMessage } = usePasswordValidation(
    formData.password,
    formData.confirmPassword
  );

  const fieldStatus = (name: string): { error: boolean; valid: boolean; message?: string } => {
    const v = String((formData as any)[name] ?? "").trim();
    const wasTouched = !!touched[name] || submitAttempted;
    if (!wasTouched) return { error: false, valid: false }; // no mostrar nada hasta tocar

    switch (name) {
      case "nombre":{
        const valid = v.length >= 3;
        return { error: !valid, valid, message: valid ? undefined : "Ingrese su nombre en el campo" };
      }
      case "ap_paterno":{
        const valid = v.length >= 3;
        return { error: !valid, valid, message: valid ? undefined : "Ingrese su apellido paterno" };
      }
      case "ap_materno": {
        const valid = v.length >= 3;
        return { error: !valid, valid, message: valid ? undefined : "Ingrese su apellido materno" };
      }
      case "correo": {
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        return { error: !valid, valid, message: valid ? undefined : "Ingrese un correo válido." };
      }
      case "telefono": {
        const valid = v.length >= 7;
        return { error: !valid, valid, message: valid ? undefined : "Ingrese un teléfono válido (mín. 7 dígitos)." };
      }
      case "numero_documento": {
        const valid = v.length > 0;
        return { error: !valid, valid, message: valid ? undefined : "Ingrese la parte numerica de su documento de identidad" };
      }
      case "complemento_documento": {
        if (!v) return { error: false, valid: false };
        const ok = /^[A-Z0-9Ñ-]{1,3}$/.test(v) && (v.match(/-/g)?.length ?? 0) <= 1;
        return { error: !ok, valid: ok, message: ok ? undefined : "Máx. 3 (A-Z/Ñ, 0-9, un guion)." };
      }
      
      case "profesion":
      case "institucion":
      case "cargo": {
        const valid = v.length > 0;
        return { error: false, valid, message: undefined };
      }
      default: {
        const valid = v.length > 0;
        return { error: !valid, valid, message: valid ? undefined : "Rellene los campos obligatorios." };
      }
    }
    
  };
  
  const preventSpaceKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " ") e.preventDefault();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "correo") {
      newValue = value.replace(/\s+/g, "").slice(0, 80);
    }

    if (name === "password" || name === "confirmPassword") {
      newValue = value.replace(/\s/g, "").slice(0, 30);
    }
    if (["nombre", "ap_paterno", "ap_materno", "institucion", "profesion", "cargo"].includes(name)) {
      newValue = value
        .replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "")
        .replace(/\s{2,}/g, " ")
        .replace(/^\s+/, "")
        .slice(0, 40);
    }
    if (name === "telefono") {
      newValue = value.replace(/[^0-9]/g, "").slice(0, 9);
    }
    if (name === "numero_documento") {
      newValue = value.replace(/[^0-9-]/g, "").slice(0, 10);
    }
    if (name === "complemento_documento") {
      let s = value.toUpperCase().replace(/[^A-Z0-9Ñ-]/g, "");

      const firstDash = s.indexOf("-");
      if (firstDash !== -1) {
        s = s.slice(0, firstDash + 1) + s.slice(firstDash + 1).replace(/-/g, "");
      }
      newValue = s.slice(0, 3);
    }
    

    setFormData(prev => ({ ...prev, [name]: newValue }));
    setTouched(prev => ({ ...prev, [name]: true }));   // ← valida mientras escribe
    setError("");
    setSuccess("");
  };


  const getErrorMessage = (err: unknown) => {
    if (err instanceof Error) return err.message;
    return String(err);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError("");
  setSuccess("");
  setSubmitAttempted(true);

  // 1) Marcar todos los campos como tocados → muestra todos los errores
  setTouched({
    nombre: true,
    ap_paterno: true,
    ap_materno: true,
    correo: true,
    password: true,
    confirmPassword: true,
    telefono: true,
    tipo_documento: true,
    numero_documento: true,
    complemento_documento: true, 
    profesion: true,
    institucion: true,
    cargo: true,
  });

  const requeridos: Array<keyof typeof formData> = [
    "nombre",
    "ap_paterno",
    "ap_materno",
    "correo",
    "telefono",
    "numero_documento",
    "password",
    "confirmPassword",
  ];

  // revisa si hay errores en los requeridos
  const hayErroresBasicos = requeridos.some((f) => fieldStatus(f).error);

  if (hayErroresBasicos || !valid) {
    setError("Por favor, completa los campos obligatorios y corrige los resaltados.");
    return;
  }

  if (!isChecked) {
    setError("Debe aceptar los términos y condiciones.");
    return;
  }

  //  Si todo OK, enviar
  setLoading(true);
  try {
    const payload: RegistroEvaluadorPayload = {
      ...formData,
      aceptaTerminos: true,
    };

    await register(payload);
    
    setSuccess("Registro exitoso. Redirigiendo al dashboard...");
    setTimeout(() => navigate("/dashboard"), 2000);

    // reset
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
      complemento_documento:"",
      profesion: "",
      institucion: "",
      cargo: "",
    });
    setIsChecked(false);
    setTouched({});
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
          
          {(() => { const s = fieldStatus("nombre");
            return (
              <div>
                <Label>Nombre <span className="text-red-500">*</span></Label>
                <Input type="text" name="nombre" placeholder="Ingrese su nombre" value={formData.nombre} onChange={handleChange} onBlur={handleBlur} error={s.error}  success={s.valid} hint={s.message} />
              </div>
             );
          })()}

          {(() => { const s = fieldStatus("ap_paterno");
            return (
              <div>
                <Label>Apellido Paterno <span className="text-red-500">*</span></Label>
                <Input type="text" name="ap_paterno" placeholder="Apellido paterno" value={formData.ap_paterno} onChange={handleChange} onBlur={handleBlur} error={s.error}  success={s.valid} hint={s.message}/>
              </div>
            );
          })()}

          {(() => { const s = fieldStatus("ap_materno");
            return (
              <div>
                <Label>Apellido Materno <span className="text-red-500">*</span></Label>
                <Input type="text" name="ap_materno" placeholder="Apellido materno" value={formData.ap_materno} onChange={handleChange} onBlur={handleBlur} error={s.error}  success={s.valid} hint={s.message}/>
              </div>
            );
          })()}

          {(() => { const s = fieldStatus("correo");
            return (
              <div>
                <Label>Correo electrónico <span className="text-red-500">*</span></Label>
                <Input type="email" name="correo" placeholder="ejemplo@gmail.com" value={formData.correo} onKeyDown={preventSpaceKey} onChange={handleChange} onBlur={handleBlur} error={s.error}  success={s.valid} hint={s.message}/>
              </div>
            );
          })()}

          {(() => { const s = fieldStatus("telefono");
            return (
              <div>
                <Label>Teléfono <span className="text-red-500">*</span></Label>
                <Input type="text" name="telefono" placeholder="Ej: 76543210" value={formData.telefono} onChange={handleChange} onBlur={handleBlur} error={s.error}  success={s.valid} hint={s.message}/>
              </div>
            );
          })()}

          {(() => { 
            const s = fieldStatus("numero_documento");
            const sComp = fieldStatus("complemento_documento");

            return (
              <DocumentField
                tipo_documento={formData.tipo_documento}
                numero_documento={formData.numero_documento}
                complemento_documento={formData.complemento_documento}
                onChange={handleChange}
                onBlur={handleBlur}
                invalidNumero={s.error}
                validNumero={s.valid}
                validComplemento={sComp.valid}  
                numeroHint={s.message}
              />
            );
          })()}

          {(() => { const s = fieldStatus("profesion");
            return (
              <div>
                <Label>Profesión</Label>
                <Input type="text" name="profesion" placeholder="Ej: Ingeniero Civil" value={formData.profesion} onChange={handleChange} onBlur={handleBlur}  success={s.valid} />
              </div>
            );
          })()}

          {(() => { const s = fieldStatus("institucion");
            return (
              <div>
                <Label>Institución / Unidad</Label>
                <Input type="text" name="institucion" placeholder="Ej: UMSS" value={formData.institucion} onChange={handleChange} onBlur={handleBlur} success={s.valid} />
              </div>
            );
          })()}

          {(() => { const s = fieldStatus("cargo");
            return (
              <div>
                <Label>Cargo</Label>
                <Input type="text" name="cargo" placeholder="Ej: Docente" value={formData.cargo} onChange={handleChange} onBlur={handleBlur} success={s.valid} />
              </div>
            );
          })()}

          <PasswordField
            password={formData.password}
            confirmPassword={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            blockSpaces

            invalidPassword={!!touched.password && !match}
            validPassword={!!touched.password && match}

            invalidConfirm={!!touched.confirmPassword && (!match || !valid)}
            validConfirm={!!touched.confirmPassword && match && valid}

            passwordHint={touched.password ? passwordMessage : undefined}
            confirmHint={touched.confirmPassword ? confirmMessage : undefined}
          />
          

          <div className="flex items-start gap-3">
            <Checkbox className="w-4 h-4 mt-1" checked={isChecked} onChange={(checked: boolean) => setIsChecked(checked)} />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Acepto los <span className="underline cursor-pointer text-gray-800 dark:text-white/90">Términos y Condiciones</span> y la{" "}
              <span className="underline cursor-pointer text-gray-800 dark:text-white/90">Política de Privacidad.</span>
            </p>
          </div>

          <SubmitButton
            loading={loading}
            text="Registrarte"
            loadingText="Registrando..."
            disabled={!isChecked || loading}
          />
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