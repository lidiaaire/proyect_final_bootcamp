// Este archivo define los tipos de historial que se utilizan para registrar las acciones realizadas en el sistema relacionadas con las solicitudes. Estos tipos de historial se utilizan para mantener un registro detallado de las acciones realizadas por los usuarios (prestaciones, dirección médica, asesoría jurídica, etc.) en cada solicitud, lo que permite un seguimiento completo del proceso de gestión de cada solicitud.
// Los tipos de historial definidos son: CREACION, SOLICITUD_DOCUMENTACION, AUTORIZACION y RECHAZO. Estos tipos se utilizan en los servicios y controladores relacionados con las solicitudes para registrar cada acción realizada en el historial de cada solicitud.

const TIPOS_HISTORIAL = {
  CREACION: "CREACION",
  SOLICITUD_DOCUMENTACION: "SOLICITUD_DOCUMENTACION",
  AUTORIZACION: "AUTORIZACION",
  RECHAZO: "RECHAZO",
};

module.exports = TIPOS_HISTORIAL;
