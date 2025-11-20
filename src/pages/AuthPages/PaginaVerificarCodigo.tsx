import AuthLayout from "./LayoutAutenticacion";

import VerifyCodeForm from "../../components/auth/FormularioCodigoDeVerificacion"; 

export default function VerifyCodePage() {
  return (
    <AuthLayout>
      <VerifyCodeForm />
    </AuthLayout>
  );
}