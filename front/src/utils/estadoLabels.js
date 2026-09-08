// Mantenido solo por compatibilidad de import. La fuente única de verdad
// de labels de estado es ahora core/constants/estados.js (Sprint 2A).
import { ESTADOS, getEstadoLabel } from "@/core/constants/estados";

export const ESTADO_LABELS = Object.fromEntries(
  Object.values(ESTADOS).map((estado) => [estado, getEstadoLabel(estado)]),
);
