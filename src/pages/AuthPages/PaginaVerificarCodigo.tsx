import AuthLayout from "./LayoutAutenticacion";

import VerifyCodeForm from "../../components/auth/VerifyCodeForm"; 

export default function VerifyCodePage() {
  return (
    <AuthLayout>
      <VerifyCodeForm />
    </AuthLayout>
  );
}