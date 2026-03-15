import { apiFetch } from "./apiClient";

// Normaliza el modelo de datos para que todo el frontend pueda usar SIEMPRE el mismo identificador.
// Si el backend devuelve _id (Mongo), lo convertimos también en id para evitar undefined en rutas.
const normalizeSolicitud = (solicitud) => {
  return {
    ...solicitud,
    id: solicitud._id || solicitud.id,
  };
};

export const getSolicitudes = async () => {
  const response = await apiFetch("http://localhost:4000/api/solicitudes");

  if (!response.ok) {
    throw new Error("Error al obtener solicitudes");
  }

  const data = await response.json();

  // El backend a veces devuelve {data: []}, {solicitudes: []} o directamente []
  const solicitudesArray = data?.data || data?.solicitudes || data || [];

  return solicitudesArray.map(normalizeSolicitud);
};

export const changeEstado = async (id, nuevoEstado) => {
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

  const data = await response.json();

  return normalizeSolicitud(data);
};
