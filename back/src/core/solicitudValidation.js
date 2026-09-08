// Validación explícita del payload de creación de una Solicitud. No se
// delega en Mongoose ni en el frontend: se valida aquí, en el backend,
// antes de tocar la base de datos.
//
// DECISIÓN DE DISEÑO (Sprint 1C) sobre "propiedades de sistema que el
// cliente intente inyectar" (estadoInterno, currentDepartment,
// historial, numeroSolicitud, notas, autorizacionPdf, _id, etc.):
// se ignoran por construcción, no se rechaza la petición por incluirlas.
// Esta función solo LEE los campos de la lista blanca de abajo; todo lo
// demás que venga en el body nunca se copia a ningún sitio, así que no
// hay forma de que el cliente decida el estado inicial, el
// departamento, el historial o el autor -- eso lo fija siempre
// solicitudService.createSolicitud en servidor. Se documenta aquí en vez
// de devolver 400 por campos desconocidos para no ser frágil ante un
// cliente que envíe campos adicionales inofensivos (p. ej. metadatos de
// formulario).

const CAMPOS_TEXTO_OBLIGATORIOS = [
  "numeroPoliza",
  "nombrePrueba",
  "especialidad",
  "centroMedico",
];

class ValidationError extends Error {
  constructor(message, { code, errors } = {}) {
    super(message);
    this.name = "ValidationError";
    this.code = code || "PAYLOAD_INVALIDO";
    this.errors = errors || [];
    this.statusCode = 400;
  }
}

function esStringNoVacio(value) {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Valida el payload de POST /api/solicitudes. Devuelve un objeto limpio
 * con solo los campos permitidos (trim aplicado) o lanza ValidationError
 * (400) con la lista completa de problemas encontrados.
 */
function validateCreateSolicitudPayload(body) {
  const payload = body && typeof body === "object" && !Array.isArray(body) ? body : {};
  const errores = [];

  for (const campo of CAMPOS_TEXTO_OBLIGATORIOS) {
    const valor = payload[campo];

    if (valor === undefined || valor === null) {
      errores.push(`El campo "${campo}" es obligatorio.`);
    } else if (typeof valor !== "string") {
      errores.push(`El campo "${campo}" debe ser un texto.`);
    } else if (!esStringNoVacio(valor)) {
      errores.push(`El campo "${campo}" no puede estar vacío.`);
    }
  }

  if (
    payload.comentario !== undefined &&
    payload.comentario !== null &&
    typeof payload.comentario !== "string"
  ) {
    errores.push('El campo "comentario" debe ser un texto si se envía.');
  }

  if (errores.length > 0) {
    throw new ValidationError(
      "El payload de creación de la solicitud no es válido.",
      { errors: errores },
    );
  }

  return {
    numeroPoliza: payload.numeroPoliza.trim(),
    nombrePrueba: payload.nombrePrueba.trim(),
    especialidad: payload.especialidad.trim(),
    centroMedico: payload.centroMedico.trim(),
    comentario: esStringNoVacio(payload.comentario) ? payload.comentario.trim() : "",
  };
}

module.exports = { ValidationError, validateCreateSolicitudPayload };
