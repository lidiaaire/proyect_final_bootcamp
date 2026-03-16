export function createHistorialEvent({
  tipo,
  estadoAnterior,
  estadoNuevo,
  changedBy,
}) {
  return {
    tipo,
    estadoAnterior,
    estadoNuevo,
    changedBy,
    fecha: new Date(),
  };
}
