const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export async function getChannelMessages(channel) {
  const token = localStorage.getItem("token");

  // 👇 MAPEO CORRECTO
  const CHANNEL_MAP = {
    PRESTACIONES: "prestaciones",
    DIRECCION_MEDICA: "direccion-medica",
    ASESORIA_JURIDICA: "asesoria-juridica",
    GENERAL: "general",
  };

  const slug = CHANNEL_MAP[channel] || channel;

  const res = await fetch(`${API_URL}/communications/${slug}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("API ERROR:", text);
    throw new Error("Error obteniendo comunicaciones");
  }

  return res.json();
}

// POST /api/communications (ya existía en el backend -- comunications.
// service.js/communications.controller.js -- pero el composer del
// frontend nunca llegó a usarlo: MessageInput.jsx solo hacía
// console.log del mensaje). `canal` debe ser el nombre real guardado en
// la colección ("Prestaciones", no "prestaciones"), igual que en
// getChannelMessages.
export async function sendChannelMessage({ canal, titulo, contenido, tipo, autor, departamento }) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/communications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ canal, titulo, contenido, tipo, autor, departamento }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("API ERROR:", text);
    throw new Error("Error enviando el comunicado");
  }

  return res.json();
}
