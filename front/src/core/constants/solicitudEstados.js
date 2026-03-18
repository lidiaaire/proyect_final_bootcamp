// Este módulo define los estados posibles de una solicitud en el sistema. Cada estado representa una etapa diferente en el proceso de gestión de la solicitud, desde su creación hasta su resolución final. Estos estados se utilizan para controlar el flujo de trabajo de las solicitudes y para mostrar información relevante a los usuarios según el estado actual de cada solicitud. Asegúrate de que estos estados coincidan con los estados definidos en el backend para garantizar una correcta gestión y visualización de las solicitudes en la aplicación.
// La constante ESTADOS es un objeto que contiene las claves de cada estado, que se pueden utilizar en el código para comparar y mostrar el estado actual de una solicitud. Estos estados incluyen: PENDIENTE_INICIO_GESTION, DOCUMENTACION_SOLICITADA, EN_REVISION, DIRECCION_MEDICA, ASESORIA_JURIDICA, AUTORIZADA, RECHAZADA, PENDIENTE_REVISION_PRESTACIONES, PENDIENTE_DIRECCION_MEDICA y PENDIENTE_DOCUMENTACION_DEL_ASEGURADO. Cada uno de estos estados representa una etapa específica en el proceso de gestión de una solicitud y se utiliza para controlar el flujo de trabajo y la visualización de la información relacionada con las solicitudes en la aplicación.

export const ESTADOS = {
  PENDIENTE_INICIO_GESTION: "PENDIENTE_INICIO_GESTION",
  DOCUMENTACION_SOLICITADA: "DOCUMENTACION_SOLICITADA",
  EN_REVISION: "EN_REVISION",
  DIRECCION_MEDICA: "DIRECCION_MEDICA",
  ASESORIA_JURIDICA: "ASESORIA_JURIDICA",
  AUTORIZADA: "AUTORIZADA",
  RECHAZADA: "RECHAZADA",
  PENDIENTE_REVISION_PRESTACIONES: "PENDIENTE_REVISION_PRESTACIONES",
  PENDIENTE_DIRECCION_MEDICA: "PENDIENTE_DIRECCION_MEDICA",
  PENDIENTE_DOCUMENTACION_DEL_ASEGURADO:
    "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO",
};
