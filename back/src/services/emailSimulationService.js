// Este archivo contiene la lógica para simular el envío de correos electrónicos dentro de la aplicación. Define la función generarEmailSolicitudDocumentacion, que se encarga de generar un correo electrónico simulado para solicitar documentación adicional a un asegurado en relación con una solicitud específica. La función toma como parámetros la solicitud y una lista de documentos requeridos, y construye un mensaje de correo electrónico que incluye el número de solicitud, el nombre del asegurado y la lista de documentos necesarios. Además, define la función enviarEmailSimulado, que simplemente imprime el contenido del correo electrónico simulado en la consola para simular su envío. Estas funciones son útiles para probar y demostrar cómo se gestionan las comunicaciones por correo electrónico dentro de la aplicación sin necesidad de integrar un servicio real de envío de correos electrónicos.
// La función generarEmailSolicitudDocumentacion construye un mensaje de correo electrónico con un formato claro y profesional, dirigido al asegurado, y proporciona instrucciones sobre cómo subir los documentos requeridos en el portal de asegurados. La función enviarEmailSimulado se utiliza para mostrar el contenido del correo electrónico en la consola, lo que permite a los desarrolladores verificar que el mensaje se genera correctamente antes de implementar una solución real de envío de correos electrónicos en la aplicación.
// Importamos la función generarDocumentos desde el archivo generarDocumentos.js para obtener la lista de documentos requeridos para una solicitud específica.

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
