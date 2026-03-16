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
