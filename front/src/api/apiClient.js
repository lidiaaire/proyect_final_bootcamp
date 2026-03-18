// Este módulo proporciona una función apiFetch que envuelve la función fetch nativa para incluir automáticamente el token de autenticación en las solicitudes. También maneja el caso de una respuesta 401 (no autorizado) redirigiendo al usuario a la página de inicio de sesión.

// La función apiFetch toma una URL y un objeto de opciones para la solicitud. Obtiene el token de autenticación del almacenamiento local y lo incluye en los encabezados de la solicitud. Si la respuesta de la API es un error 401, elimina el token del almacenamiento local y redirige al usuario a la página de inicio de sesión. De lo contrario, devuelve la respuesta de la API para que pueda ser manejada por el código que llama a esta función.
export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    return;
  }

  return response;
};
