// src/services/olympiansService.ts
export const uploadCSV = async (file: File) => {
  const formData = new FormData();
  formData.append("archivo", file); // el campo que exige el backend

  try {
    const res = await fetch("https://back-oh-sansi.vercel.app/api/inscripciones/csv", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok || data.ok === false) {
      // Si el servidor responde con error, devolvemos la respuesta completa
      throw data;
    }

    return data; // respuesta exitosa
  } catch (err) {
    console.error("❌ Error al subir CSV:", err);
    throw err;
  }
};
