// Este archivo define los estados posibles de una solicitud en el sistema. Estos estados se utilizan para controlar el flujo de las solicitudes a medida que avanzan por diferentes etapas, como pendiente de inicio de gestión, documentación solicitada, en revisión, autorizada o rechazada. Estos estados son fundamentales para la lógica de negocio y para mostrar el estado actual de cada solicitud en la interfaz de usuario.
// Los estados definidos son: PENDIENTE_INICIO_GESTION, DOCUMENTACION_SOLICITADA, EN_REVISION, AUTORIZADA y RECHAZADA. Estos estados se utilizan en los controladores y servicios relacionados con las solicitudes para actualizar el estado de cada solicitud según las acciones realizadas por los usuarios (prestaciones, dirección médica, asesoría jurídica, etc.).

const ESTADOS = {
  PENDIENTE_INICIO_GESTION: "PENDIENTE_INICIO_GESTION",
  DOCUMENTACION_SOLICITADA: "DOCUMENTACION_SOLICITADA",
  EN_REVISION: "EN_REVISION",
  AUTORIZADA: "AUTORIZADA",
  RECHAZADA: "RECHAZADA",
};

module.exports = { ESTADOS };
