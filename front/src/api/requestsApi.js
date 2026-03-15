const API = "http://localhost:4000/api/solicitudes";

function getToken() {
  return localStorage.getItem("token");
}

export async function getRequest(id) {
  const res = await fetch(`${API}/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  return res.json();
}

export async function requestMoreDocs(id, comentarioDocs) {
  await fetch(`${API}/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({
      nuevoEstado: "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO",
      comentarioDocs,
      docsSolicitados: [],
    }),
  });
}

export async function sendToMedicalDirection(id, comentario) {
  await fetch(`${API}/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({
      nuevoEstado: "PENDIENTE_DIRECCION_MEDICA",
      comentario,
    }),
  });
}

export async function authorizeRequest(id) {
  await fetch(`${API}/${id}/autorizar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
}

export async function rejectRequest(id, comentario) {
  await fetch(`${API}/${id}/rechazar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ comentario }),
  });
}
