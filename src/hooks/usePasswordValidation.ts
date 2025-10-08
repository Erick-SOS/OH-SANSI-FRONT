import { useMemo } from "react";

export default function usePasswordValidation(password: string, confirmPassword: string) {
  return useMemo(() => {
    const length = password.length >= 8;
    const lower = /[a-z]/.test(password);
    const upper = /[A-Z]/.test(password);
    const match = password !== "" && password === confirmPassword;
    const valid = length && lower && upper && match;

    let passwordMessage = "";
    if (!length) passwordMessage = "La contraseña debe tener al menos 8 caracteres.";
    else if (!lower || !upper)
      passwordMessage = "Debe incluir letras mayúsculas y minúsculas.";
    else if (!match)
      passwordMessage = "Las contraseñas no coinciden.";
    else if (valid)
      passwordMessage = "La contraseña es válida.";

    return {
      length,
      lower,
      upper,
      match,
      valid,
      passwordMessage,
    };
  }, [password, confirmPassword]);
}