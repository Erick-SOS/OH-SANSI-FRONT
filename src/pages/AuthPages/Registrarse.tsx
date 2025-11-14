import PageMeta from "../../components/common/PaginaMeta";
import AuthLayout from "./LayoutAutenticacion";
import SignUpForm from "../../components/auth/FormularioRegistro";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="React.js SignUp Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js SignUp Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
