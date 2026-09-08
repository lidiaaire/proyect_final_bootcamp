const API_BASE = process.env.NEXT_PUBLIC_API_URL;

/* ==============================
GET policyholder por número de póliza
Se usa en el formulario de nueva solicitud para confirmar que el
asegurado existe antes de enviar el formulario.
============================== */
export async function getPolicyholder(numeroPoliza) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/api/policyholders/${numeroPoliza}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (res.status === 404) return null;

  if (!res.ok) {
    throw new Error("Error buscando el asegurado");
  }

  return res.json();
}
