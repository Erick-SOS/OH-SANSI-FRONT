import AuthLayout from "./LayoutAutenticacion";
import NewPasswordForm from "../../components/auth/NuevaContraseña"; 

export default function NewPasswordPage() {
  return (
    <AuthLayout>
      <NewPasswordForm />
    </AuthLayout>
  );
}