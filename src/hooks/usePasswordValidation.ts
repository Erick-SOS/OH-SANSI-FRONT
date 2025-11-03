import { useMemo } from "react";

export default function usePasswordValidation(password: string, confirmPassword: string) {
  return useMemo(() => {
    const length = password.length >= 8;
    const lower = /[a-z]/.test(password);
    const upper = /[A-Z]/.test(password);

    const validPassword = length && lower && upper;
    const validConfirm = confirmPassword.length > 0 && password === confirmPassword;

    // Mantengo los nombres antiguos por compatibilidad:
    const match = validPassword;
    const valid = validPassword && validConfirm;

    // Mensaje SOLO del formato de contraseña
    let passwordMessage = "";
    if (!length) passwordMessage = "La contraseña debe tener al menos 8 caracteres.";
    else if (!lower || !upper) passwordMessage = "Debe incluir letras mayúsculas y minúsculas.";
    else if (validPassword) passwordMessage = "Contraseña con formato válido.";

    // Mensaje SOLO de la confirmación
    let confirmMessage = "";
    if (confirmPassword.length > 0 && !validConfirm) confirmMessage = "Las contraseñas no coinciden.";
    else if (validConfirm) confirmMessage = "Las contraseñas coinciden.";

    return {
      // flags base
      length,
      lower,
      upper,
      // flags nuevos y claros
      validPassword,
      validConfirm,

      // compatibilidad con tu código previo
      match,
      valid,
      // mensajes separados
      passwordMessage,
      confirmMessage,
    };
  }, [password, confirmPassword]);
}