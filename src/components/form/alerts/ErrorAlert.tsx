import { FC } from "react";
import { AlertCircle } from "lucide-react";

const ErrorAlert: FC<{ message: string | null }> = ({ message }) => {
  if (!message) return null;
  return (
    <p role="alert" className="mb-3 text-sm text-red-500 bg-red-100 p-2 rounded flex items-center gap-2">
      <AlertCircle className="w-5 h-5 text-red-600" />
      {message}
    </p>
  );
};

export default ErrorAlert;