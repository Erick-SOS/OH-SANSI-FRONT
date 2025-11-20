import AuthLayout from "./LayoutAutenticacion";
import ResetPasswordForm from "../../components/auth/RestablecerContraseña";

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <ResetPasswordForm />
    </AuthLayout>
  );
}