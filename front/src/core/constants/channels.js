import { Megaphone, ClipboardList, Stethoscope, Scale, Users } from "lucide-react";

// Fuente única de los 5 canales reales de Comunicaciones. Antes había
// tres listas duplicadas a mano (Sidebar, /comunicaciones,
// /comunicaciones/[channel] vía CommunicationsLayout) que podían
// divergir entre sí. `nombreCanal` es el valor exacto guardado en el
// campo `canal` de la colección `communications` (back/.../
// communications.controller.js#channelMap) -- necesario para consultar
// el backend real, no solo para mostrar la etiqueta.
export const CHANNELS = [
  {
    id: "avisos-oficiales",
    nombreCanal: "Avisos Oficiales",
    label: "Avisos Oficiales",
    Icon: Megaphone,
    description: "Normativa interna, acuerdos con hospitales y cambios corporativos.",
  },
  {
    id: "prestaciones",
    nombreCanal: "Prestaciones",
    label: "Prestaciones",
    Icon: ClipboardList,
    description: "Gestión y cambios en autorizaciones médicas.",
  },
  {
    id: "direccion-medica",
    nombreCanal: "Dirección Médica",
    label: "Dirección Médica",
    Icon: Stethoscope,
    description: "Criterios clínicos, protocolos y directrices médicas.",
  },
  {
    id: "asesoria-juridica",
    nombreCanal: "Asesoría Jurídica",
    Icon: Scale,
    label: "Asesoría Jurídica",
    description: "Aspectos legales, normativas y validaciones jurídicas.",
  },
  {
    id: "general",
    nombreCanal: "General",
    label: "General",
    Icon: Users,
    description: "Comunicación global entre todos los miembros.",
  },
];

export function getChannelById(id) {
  return CHANNELS.find((c) => c.id === id) || null;
}

// Único vocabulario real de `tipo` (comunicaciones.controller.js /
// datos ya sembrados) -- no existen "borrador"/"publicado"/"archivado"
// ni "recordatorio"/"acuerdo"/"documento" como valores reales; no se
// inventan aquí.
export const TIPO_META = {
  informativo: { label: "Informativo", tone: "info" },
  actualizacion: { label: "Actualización", tone: "success" },
  normativa: { label: "Normativa", tone: "warning" },
  legal: { label: "Legal", tone: "danger" },
  protocolo: { label: "Protocolo", tone: "neutral" },
};
