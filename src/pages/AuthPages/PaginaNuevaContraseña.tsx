import AuthLayout from "./LayoutAutenticacion";
import NewPasswordForm from "../../components/auth/NewPasswordForm"; 

export default function NewPasswordPage() {
  return (
    <AuthLayout>
      <NewPasswordForm />
    </AuthLayout>
  );
}