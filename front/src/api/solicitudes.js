import { normalizeSolicitud } from "@/core/normalizers/solicitudNormalizer";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const API_URL = `${API_BASE}/api/solicitudes`;
/* ==============================
GET solicitudes
============================== */

export async function getSolicitudes() {
  const res = await fetch(API_URL);

  if (!res.ok) {
    const text = await res.text();
    console.error("API ERROR:", res.status, text);
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
