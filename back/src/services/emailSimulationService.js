// src/services/emailSimulationService.js

/*
This service simulates sending emails to the insured user.
Instead of sending a real email, it logs the message and
returns the generated email content so it can be shown in the UI
or stored for demo purposes.
*/

function generarEmailSolicitudDocumentacion(solicitud, documentos) {
  const asunto = "Documentación adicional requerida para su solicitud";

  const listaDocs = documentos
    .map((doc) => `• ${doc.replace("_", " ")}`)
    .join("\n");

  const mensaje = `
Estimado/a ${solicitud.nombreCompleto},

Para continuar con la gestión de su solicitud (${solicitud.numeroSolicitud})
necesitamos que aporte la siguiente documentación:

${listaDocs}

Puede subir los documentos en el portal de asegurados.

Atentamente,
Departamento de Prestaciones
`;

  return {
    to: solicitud.nombreCompleto,
    subject: asunto,
    body: mensaje,
    createdAt: new Date(),
  };
}

function enviarEmailSimulado(email) {
  console.log("====================================");
  console.log("EMAIL SIMULADO ENVIADO");
  console.log("Destinatario:", email.to);
  console.log("Asunto:", email.subject);
  console.log("Mensaje:");
  console.log(email.body);
  console.log("====================================");

  return email;
}

module.exports = {
  generarEmailSolicitudDocumentacion,
  enviarEmailSimulado,
};
