// Este módulo define funciones para interactuar con la API de solicitudes. Incluye funciones para obtener todas las solicitudes, obtener una solicitud específica por ID, solicitar documentación adicional, enviar una solicitud a dirección médica, enviar una solicitud a asesoría jurídica, autorizar una solicitud y rechazar una solicitud. Asegúrate de que la URL de la API esté configurada correctamente antes de usar estas funciones.
// Estas funciones utilizan la función apiFetch para realizar las solicitudes a la API, lo que garantiza que el token de autenticación se incluya automáticamente en cada solicitud. Además, estas funciones manejan los casos de error y devuelven los datos en formato JSON para que puedan ser utilizados por el código que llama a estas funciones.

import { normalizeSolicitud } from "@/core/normalizers/solicitudNormalizer";

const API_URL = "http://localhost:4000/api/solicitudes";

/* ==============================
GET solicitudes
============================== */

export async function getSolicitudes(token) {
  const res = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Error obteniendo solicitudes");
  }

  const data = await res.json();

  const solicitudesNormalizadas = (data.solicitudes || []).map(
    normalizeSolicitud,
  );

  return solicitudesNormalizadas;
}

/* ==============================
GET solicitud
============================== */

export async function getRequest(id) {
  const token = localStorage.getItem("token");

  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/${id}`, { headers });

  if (res.status === 404) {
    console.warn("Solicitud no encontrada");
    return null;
  }

  if (!res.ok) {
    const text = await res.text();
    console.error("API ERROR:", res.status, text);
    throw new Error("Error obteniendo solicitud");
  }

  const data = await res.json();
  const solicitud = data.solicitud || data;

  return normalizeSolicitud(solicitud);
}

/* ==============================
SOLICITAR DOCUMENTACION
============================== */

export async function requestMoreDocs(id, payload) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/${id}/solicitar-documentacion`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Error solicitando documentación");
  }

  return res.json();
}

/* ==============================
ENVIAR A DIRECCION MEDICA
============================== */

export async function sendToMedicalDirection(id, justificacion) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/${id}/enviar-direccion-medica`, {
    method: "POST",
    headers,
    body: JSON.stringify({ justificacion }),
  });

  if (!res.ok) {
    throw new Error("Error enviando a dirección médica");
  }

  return res.json();
}

/* ==============================
ENVIAR ASESORIA JURIDICA
============================== */
export const sendToLegal = async (id, motivo) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `http://localhost:4000/api/solicitudes/${id}/enviar-asesoria-juridica`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        justificacion: motivo,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Error enviando a asesoría jurídica");
  }

  return response.json();
};
/* ==============================
AUTORIZAR
============================== */

export async function authorizeRequest(id, justificacion) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/${id}/autorizar`, {
    method: "POST",
    headers,
    body: JSON.stringify({ justificacion }),
  });

  if (!res.ok) {
    throw new Error("Error autorizando solicitud");
  }

  return res.json();
}

/* ==============================
RECHAZAR
============================== */

export async function rejectRequest(id, justificacion) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/${id}/rechazar`, {
    method: "POST",
    headers,
    body: JSON.stringify({ justificacion }),
  });

  if (!res.ok) {
    throw new Error("Error rechazando solicitud");
  }

  return res.json();
}
