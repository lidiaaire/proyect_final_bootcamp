// Este archivo contiene la lógica de comunicaciones para la aplicación. Define las funciones getMessagesByChannel y createMessage, que se encargan de obtener los mensajes de un canal específico y crear un nuevo mensaje, respectivamente. Estas funciones interactúan con una base de datos simulada (messagesDB) para almacenar y recuperar los mensajes de las comunicaciones dentro de la aplicación. La función getMessagesByChannel filtra los mensajes por el canal especificado, mientras que la función createMessage genera un nuevo mensaje con un ID único basado en la marca de tiempo actual y lo agrega a la base de datos simulada. Estas funciones son fundamentales para gestionar las comunicaciones entre los diferentes departamentos y usuarios dentro de la aplicación, lo que mejora la colaboración y la eficiencia en la gestión de las solicitudes y otras funcionalidades relacionadas.
// La función getMessagesByChannel toma un parámetro channel y devuelve una lista de mensajes que pertenecen a ese canal específico. La función createMessage toma un objeto data que contiene la información del mensaje, genera un nuevo mensaje con un ID único y lo agrega a la base de datos simulada. Estas funciones se utilizan en los controladores de comunicaciones para manejar las solicitudes de obtener mensajes y enviar nuevos mensajes, lo que permite a los usuarios interactuar con el sistema de comunicaciones de la aplicación de manera efectiva.
// Importamos la base de datos simulada de mensajes desde el archivo communications.db.js.

import { messagesDB } from "../mocks/communications.db.js";

export function getMessagesByChannel(channel) {
  return messagesDB.filter((m) => m.channel === channel);
}

export function createMessage(data) {
  const newMessage = {
    id: Date.now().toString(),
    ...data,
  };

  messagesDB.push(newMessage);

  return newMessage;
}
