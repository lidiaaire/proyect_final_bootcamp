// Este archivo define un objeto llamado ESTADO_LABELS que mapea los estados de una gestión a etiquetas legibles para mostrar en la interfaz de usuario. Cada clave del objeto representa un estado específico, y su valor correspondiente es la etiqueta que se mostrará al usuario para ese estado. Esto permite una fácil traducción de los estados técnicos a términos más comprensibles y amigables para el usuario final, mejorando la experiencia de navegación y comprensión de la aplicación.

export const ESTADO_LABELS = {
  PENDIENTE_INICIO_GESTION: "Inicio",
  PENDIENTE_DIRECCION_MEDICA: "Dir. Médica",
  PENDIENTE_ASESORIA_JURIDICA: "Jurídica",
  PENDIENTE_DOCUMENTACION_DEL_ASEGURADO: "Documentación",
  PENDIENTE_REVISION_PRESTACIONES: "Revisión",
  AUTORIZADA: "Autorizada",
  RECHAZADA: "Rechazada",
};
