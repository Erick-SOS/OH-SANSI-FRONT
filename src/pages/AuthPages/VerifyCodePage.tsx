import AuthLayout from "./AuthPageLayout";

import VerifyCodeForm from "../../components/auth/VerifyCodeForm"; 

export default function VerifyCodePage() {
  return (
    <AuthLayout>
      <VerifyCodeForm />
    </AuthLayout>
  );
}