import { normalizeSolicitud } from "@/core/normalizers/solicitudNormalizer";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const API_URL = `${API_BASE}/api/solicitudes`;

// Construye un Error con el mensaje REAL devuelto por el backend
// (403 "fuera de responsabilidad", 409 "estado final", etc.) en vez de
// un texto genérico -- Sprint 2A, punto 8: un error esperado no debe
// representarse como un fallo incomprensible.
async function throwApiError(res, fallback) {
  const data = await res.json().catch(() => ({}));
  const error = new Error(data.message || fallback);
  error.status = res.status;
  error.code = data.code;
  throw error;
}

/* ==============================
GET solicitudes
============================== */

export async function getSolicitudes() {
  const token = localStorage.getItem("token");

  const res = await fetch(API_URL, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    await throwApiError(res, "Error obteniendo solicitudes");
  }

  const data = await res.json();

  const solicitudesNormalizadas = (data.solicitudes || []).map(
    normalizeSolicitud,
  );

  return solicitudesNormalizadas;
}
/* ==============================
GET solicitud
Distingue 404 (no existe, devuelve null) de cualquier otro error
(403 sin visibilidad, etc.), que se lanza con su status real para que
la pantalla pueda mostrar el estado adecuado (ver pages/solicitudes/[id].js).
============================== */

export async function getRequest(id) {
  const token = localStorage.getItem("token");

  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/${id}`, { headers });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    await throwApiError(res, "Error obteniendo solicitud");
  }

  const data = await res.json();
  const solicitud = data.solicitud || data;

  return normalizeSolicitud(solicitud);
}

/* ==============================
CREAR SOLICITUD
============================== */

export async function createSolicitud(payload) {
  const token = localStorage.getItem("token");

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.message || "Error creando la solicitud");
    error.status = res.status;
    error.code = data.code;
    error.details = data.errors;
    throw error;
  }

  return normalizeSolicitud(data.solicitud);
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
    await throwApiError(res, "Error solicitando documentación");
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
    await throwApiError(res, "Error enviando a dirección médica");
  }

  return res.json();
}

/* ==============================
ENVIAR ASESORIA JURIDICA
============================== */
export const sendToLegal = async (id, motivo) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/${id}/enviar-asesoria-juridica`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      justificacion: motivo,
    }),
  });

  if (!response.ok) {
    await throwApiError(response, "Error enviando a asesoría jurídica");
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
    await throwApiError(res, "Error autorizando solicitud");
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
    await throwApiError(res, "Error rechazando solicitud");
  }

  return res.json();
}
