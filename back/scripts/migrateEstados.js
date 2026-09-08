// migrateEstados.js
//
// Migra las Solicitud existentes que están en un estado del modelo
// anterior (o en uno de los estados "no documentados" observados en
// producción durante la auditoría) al modelo de 6 estados de
// core/solicitudFlowRules.js.
//
// Uso:
//   node scripts/migrateEstados.js            -> aplica la migración
//   node scripts/migrateEstados.js --dry-run  -> solo informa, no escribe
//
// Es idempotente: una solicitud ya migrada (estadoInterno ya es uno de
// los 6 estados canónicos) no se toca en una segunda ejecución.

require("dotenv").config();
const mongoose = require("mongoose");
const Solicitud = require("../src/models/solicitudModel");
const { ESTADOS, isEstadoValido } = require("../src/core/solicitudFlowRules");
const { ROLES_OPERATIVOS } = require("../src/core/solicitudPermissions");

const DRY_RUN = process.argv.includes("--dry-run");

// Normaliza el campo currentDepartment (histórico: minúsculas sin guión
// bajo, p. ej. "direccionmedica") a los mismos valores que usa el enum
// de rol de usuario.
function normalizarDepartamento(valor) {
  const v = String(valor || "").toLowerCase();
  if (v.includes("juridic")) return "ASESORIA_JURIDICA";
  if (v.includes("medic")) return "DIRECCION_MEDICA";
  if (v.includes("prestacion")) return "PRESTACIONES";
  return null;
}

// Decide el estado y departamento canónicos para un documento con un
// estadoInterno legacy. Devuelve null si no se puede determinar con
// confianza (para no migrar "adivinando").
function resolverMigracion(solicitud) {
  const legacy = solicitud.estadoInterno;
  const deptoNormalizado = normalizarDepartamento(solicitud.currentDepartment);

  switch (legacy) {
    case "PENDIENTE_INICIO_GESTION":
      return { estado: ESTADOS.PENDIENTE_GESTION, departamento: "PRESTACIONES" };

    case "DOCUMENTACION_SOLICITADA":
    case "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO":
      return {
        estado: ESTADOS.DOCUMENTACION_PENDIENTE,
        departamento: deptoNormalizado || "PRESTACIONES",
      };

    case "DOCUMENTACION_RECIBIDA":
      // No hay forma fiable de saber quién la pidió en el modelo antiguo;
      // se devuelve a gestión, que es el punto de entrada seguro.
      return { estado: ESTADOS.PENDIENTE_GESTION, departamento: "PRESTACIONES" };

    case "PENDIENTE_DIRECCION_MEDICA":
      return { estado: ESTADOS.EN_REVISION_MEDICA, departamento: "DIRECCION_MEDICA" };

    case "PENDIENTE_ASESORIA_JURIDICA":
      return { estado: ESTADOS.EN_REVISION_JURIDICA, departamento: "ASESORIA_JURIDICA" };

    case "EN_REVISION":
      // El modelo antiguo distinguía DM/AJ solo por currentDepartment.
      if (deptoNormalizado === "ASESORIA_JURIDICA") {
        return { estado: ESTADOS.EN_REVISION_JURIDICA, departamento: "ASESORIA_JURIDICA" };
      }
      if (deptoNormalizado === "DIRECCION_MEDICA") {
        return { estado: ESTADOS.EN_REVISION_MEDICA, departamento: "DIRECCION_MEDICA" };
      }
      // Departamento ambiguo/perdido: no se adivina, se marca para
      // revisión manual.
      return null;

    default:
      return null;
  }
}

async function migrar() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Conectado a MongoDB. Modo: ${DRY_RUN ? "DRY-RUN (sin escribir)" : "APLICAR"}`);

  const todas = await Solicitud.find({});
  console.log(`Solicitudes totales: ${todas.length}`);

  const yaCanonicas = todas.filter((s) => isEstadoValido(s.estadoInterno));
  const legacy = todas.filter((s) => !isEstadoValido(s.estadoInterno));

  console.log(`Ya en estado canónico (sin cambios): ${yaCanonicas.length}`);
  console.log(`En estado legacy a migrar: ${legacy.length}`);

  let migradas = 0;
  let ambiguas = [];

  for (const solicitud of legacy) {
    const resultado = resolverMigracion(solicitud);

    if (!resultado) {
      ambiguas.push({
        id: solicitud._id.toString(),
        numeroSolicitud: solicitud.numeroSolicitud,
        estadoInterno: solicitud.estadoInterno,
        currentDepartment: solicitud.currentDepartment,
      });
      continue;
    }

    const estadoAnterior = solicitud.estadoInterno;

    console.log(
      `  ${solicitud.numeroSolicitud || solicitud._id}: "${estadoAnterior}" (${solicitud.currentDepartment || "-"}) -> "${resultado.estado}" (${resultado.departamento})`,
    );

    if (!DRY_RUN) {
      solicitud.estadoInterno = resultado.estado;
      solicitud.currentDepartment = resultado.departamento;
      solicitud.historial.push({
        estadoAnterior,
        estado: resultado.estado,
        accion: "MIGRACION_ESTADO",
        departamento: resultado.departamento,
        changedBy: "SYSTEM_MIGRATION",
        comentario:
          "Migrado automáticamente desde el modelo de estados anterior (Sprint 1A).",
        fecha: new Date(),
      });
      await solicitud.save();
    }

    migradas++;
  }

  console.log(`\nMigradas: ${migradas}`);

  if (ambiguas.length) {
    console.log(
      `\nNo migradas por ambigüedad (requieren revisión manual): ${ambiguas.length}`,
    );
    console.table(ambiguas);
  }

  // Paso 2: normalizar currentDepartment en documentos cuyo estadoInterno
  // YA era canónico (por tanto no pasaron por el paso 1) pero cuyo
  // departamento venía en el vocabulario antiguo en minúsculas, p. ej.
  // solicitudes ya AUTORIZADA/RECHAZADA de antes de este sprint.
  const conDepartamentoLegacy = todas.filter(
    (s) => isEstadoValido(s.estadoInterno) && !ROLES_OPERATIVOS.includes(s.currentDepartment),
  );

  console.log(
    `\nCon estado canónico pero departamento en formato antiguo: ${conDepartamentoLegacy.length}`,
  );

  let departamentosNormalizados = 0;

  for (const solicitud of conDepartamentoLegacy) {
    const nuevoDepartamento = normalizarDepartamento(solicitud.currentDepartment);

    if (!nuevoDepartamento) {
      console.log(
        `  AVISO: no se pudo normalizar el departamento "${solicitud.currentDepartment}" de ${solicitud.numeroSolicitud} (revisión manual).`,
      );
      continue;
    }

    const departamentoAnterior = solicitud.currentDepartment;

    console.log(
      `  ${solicitud.numeroSolicitud || solicitud._id}: departamento "${departamentoAnterior}" -> "${nuevoDepartamento}" (estado ${solicitud.estadoInterno} sin cambios)`,
    );

    if (!DRY_RUN) {
      solicitud.currentDepartment = nuevoDepartamento;
      solicitud.historial.push({
        estadoAnterior: solicitud.estadoInterno,
        estado: solicitud.estadoInterno,
        accion: "NORMALIZACION_DEPARTAMENTO",
        departamento: nuevoDepartamento,
        changedBy: "SYSTEM_MIGRATION",
        comentario: `Departamento normalizado desde "${departamentoAnterior}" (Sprint 1B).`,
        fecha: new Date(),
      });
      await solicitud.save();
    }

    departamentosNormalizados++;
  }

  console.log(`Departamentos normalizados: ${departamentosNormalizados}`);

  if (DRY_RUN) {
    console.log("\nDRY-RUN: no se ha escrito nada en la base de datos.");
  }

  await mongoose.disconnect();
}

migrar().catch((error) => {
  console.error("Error migrando estados:", error);
  process.exit(1);
});
