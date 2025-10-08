import React from "react";

interface Props {
  loading?: boolean;
  text: string;
  loadingText?: string;
}

const SubmitButton: React.FC<Props> = ({ loading = false, text, loadingText = "Cargando..." }) => {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white rounded-lg transition 
      ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
    >
      {loading ? loadingText : text}
    </button>
  );
};

export default SubmitButton;