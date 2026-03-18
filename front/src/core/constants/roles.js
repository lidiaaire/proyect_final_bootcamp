// Este módulo define los roles de usuario y su configuración visual para la aplicación. Cada rol tiene una etiqueta, un color de texto y un color de fondo asociados que se pueden utilizar en la interfaz de usuario para diferenciar visualmente a los usuarios según su rol. Asegúrate de que estos roles coincidan con los roles definidos en el backend para garantizar una correcta asignación de permisos y funcionalidades en la aplicación.
// La constante ROLE_CONFIG es un objeto que contiene la configuración de cada rol, incluyendo su etiqueta (label), color de texto (color) y color de fondo (bg). Esta configuración se puede utilizar en los componentes de la interfaz de usuario para mostrar la información del usuario de manera visualmente distintiva según su rol, lo que mejora la experiencia del usuario y facilita la identificación rápida de los roles dentro de la aplicación.

export const ROLE_CONFIG = {
  DIRECCION_MEDICA: {
    label: "Dirección médica",
    color: "#2e7d32",
    bg: "#e8f5e9",
  },
  PRESTACIONES: {
    label: "Prestaciones",
    color: "#1976d2",
    bg: "#e3f2fd",
  },
  ASESORIA_JURIDICA: {
    label: "Asesoría jurídica",
    color: "#ef6c00",
    bg: "#fff3e0",
  },
  ADMIN: {
    label: "Administración",
    color: "#6a1b9a",
    bg: "#f3e5f5",
  },
};
