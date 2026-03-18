// Este módulo define funciones para interactuar con la API de comunicaciones. Incluye funciones para obtener mensajes de un canal específico y para enviar nuevos mensajes a la API. Asegúrate de que la URL de la API esté configurada correctamente antes de usar estas funciones.

const API_URL = "http://localhost:4000/api";

// La función getChannelMessages toma el nombre de un canal como argumento y realiza una solicitud GET a la API para obtener los mensajes asociados a ese canal. Devuelve la respuesta en formato JSON para que pueda ser utilizada por el código que llama a esta función.
export async function getChannelMessages(channel) {
  const res = await fetch(`${API_URL}/communications/${channel}`);

  return res.json();
}

// La función sendMessage toma un objeto de datos como argumento y realiza una solicitud POST a la API para enviar un nuevo mensaje. El objeto de datos debe contener la información necesaria para crear un nuevo mensaje, como el canal al que se dirige el mensaje, el contenido del mensaje y el autor del mensaje. Devuelve la respuesta en formato JSON para que pueda ser utilizada por el código que llama a esta función.
export async function sendMessage(data) {
  const res = await fetch(`${API_URL}/communications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
}
