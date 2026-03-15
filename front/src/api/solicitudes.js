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
  const res = await fetch(`${API_URL}/${id}`);

  if (!res.ok) {
    throw new Error("Error obteniendo solicitud");
  }

  const data = await res.json();

  return normalizeSolicitud(data);
}

/* ==============================
SOLICITAR DOCUMENTACION
============================== */

export async function requestMoreDocs(id, documentosSolicitados) {
  const res = await fetch(`${API_URL}/${id}/solicitar-documentacion`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ documentosSolicitados }),
  });

  if (!res.ok) {
    throw new Error("Error solicitando documentación");
  }

  return res.json();
}

/* ==============================
ENVIAR A DIRECCION MEDICA
============================== */

export async function sendToMedicalDirection(id) {
  const res = await fetch(`${API_URL}/${id}/enviar-direccion-medica`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Error enviando a dirección médica");
  }

  return res.json();
}

/* ==============================
AUTORIZAR
============================== */

export async function authorizeRequest(id) {
  const res = await fetch(`${API_URL}/${id}/autorizar`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Error autorizando solicitud");
  }

  return res.json();
}

/* ==============================
RECHAZAR
============================== */

export async function rejectRequest(id, comentario) {
  const res = await fetch(`${API_URL}/${id}/rechazar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ comentario }),
  });

  if (!res.ok) {
    throw new Error("Error rechazando solicitud");
  }

  return res.json();
}
