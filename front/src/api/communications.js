const API_URL = "http://localhost:4000/api";

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
