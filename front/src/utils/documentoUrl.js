// Resuelve la URL real de un documento del expediente (Solicitud o
// Policyholder -- ambos pintan la misma lista de documentos). `doc.url`
// es la fuente de verdad, la que devuelve el backend: cada tipo
// documental puede vivir en una carpeta distinta
// ("/documentos-clinicos/..." para las 6 familias clínicas nuevas,
// "/autorizaciones/..." para VOLANTE_AUTORIZACION, ver back/src/index.js)
// así que nunca se reconstruye a partir de `doc.nombre` asumiendo una
// carpeta fija. Solo si un documento no trajera `url` (dato legacy
// incompleto) se cae al antiguo `/docs/<nombre>` como compatibilidad,
// nunca como caso normal.
//
// Extraído a un util compartido (en vez de duplicarlo en cada página)
// porque ya lo necesitan dos sitios con el mismo criterio exacto:
// pages/solicitudes/[id].js y pages/policyholders/[id].js.

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export function resolverUrlDocumento(doc) {
  if (!doc) return null;

  const url = doc.url;
  if (url) {
    if (/^https?:\/\//i.test(url)) return url;
    return `${API_BASE}${url.startsWith("/") ? url : `/${url}`}`;
  }

  // Compatibilidad legacy: documentos antiguos sin `url` guardada.
  if (doc.nombre) return `${API_BASE}/docs/${doc.nombre}`;

  return null;
}
