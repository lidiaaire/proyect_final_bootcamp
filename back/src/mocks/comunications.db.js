// Este archivo contiene una base de datos simulada de mensajes para la funcionalidad de comunicaciones internas en la aplicación. Esta base de datos se utiliza para almacenar y gestionar los mensajes enviados por los usuarios en diferentes canales de comunicación, como "Avisos Oficiales" y "Prestaciones". Cada mensaje incluye información sobre el usuario que lo envió, su rol, el texto del mensaje, la hora de envío y un avatar para representar al usuario. Esta base de datos simulada es útil para el desarrollo y las pruebas de la funcionalidad de comunicaciones internas antes de implementar una solución de almacenamiento real, como una base de datos o un servicio de mensajería.
// La estructura de cada mensaje en la base de datos incluye los siguientes campos: id (identificador único del mensaje), channel (canal de comunicación al que pertenece el mensaje), user (nombre del usuario que envió el mensaje), role (rol del usuario que envió el mensaje), avatar (iniciales del usuario para representar su avatar), text (contenido del mensaje) y time (hora en que se envió el mensaje). Esta estructura permite organizar y mostrar los mensajes de manera efectiva en la interfaz de usuario de la aplicación.

export const messagesDB = [
  {
    id: "msg1",
    channel: "Avisos Oficiales",
    user: "Dra. Marta Ruiz",
    role: "Dirección Médica",
    avatar: "MR",
    text: "Nueva indicación: las resonancias requieren informe previo.",
    time: "10:30",
  },
  {
    id: "msg2",
    channel: "Prestaciones",
    user: "Carlos Méndez",
    role: "Prestaciones",
    avatar: "CM",
    text: "Procedimiento actualizado en el sistema.",
    time: "11:20",
  },
];
