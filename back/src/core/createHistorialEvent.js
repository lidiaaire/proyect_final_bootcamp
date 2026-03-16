export function createHistorialEvent({
  tipo,
  estadoAnterior,
  estadoNuevo,
  changedBy,
}) {
  return {
    tipo,
    estado: estadoNuevo, // el frontend espera este campo
    changedBy,
    fecha: new Date(),
  };
}
