import PageMeta from "../../components/common/PaginaMeta";
import AuthLayout from "./LayoutAutenticacion";
import SignInForm from "../../components/auth/FormularioIniciarSesion";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="React.js SignIn Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js SignIn Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
