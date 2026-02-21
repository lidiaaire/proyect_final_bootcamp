import { apiFetch } from "./apiClient";

export const getSolicitudes = async (token) => {
  const response = await apiFetch("http://localhost:4000/api/solicitudes");

  if (!response.ok) {
    throw new Error("Error al obtener solicitudes");
  }

  return await response.json();
};

export const changeEstado = async (id, nuevoEstado, token) => {
  const response = await apiFetch(
    `http://localhost:4000/api/solicitudes/${id}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nuevoEstado }),
    },
  );

  if (!response.ok) {
    throw new Error("Error al cambiar estado");
  }

  return await response.json();
};
