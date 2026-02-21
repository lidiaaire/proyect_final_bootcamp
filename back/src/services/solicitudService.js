const Solicitud = require("../models/solicitudModel");
const solicitudFlowRules = require("../core/solicitudFlowRules");

const generateNumeroSolicitud = () => {
  const timestamp = Date.now();
  return `SOL-${timestamp}`;
};

const createSolicitud = async (data, user) => {
  const numeroSolicitud = generateNumeroSolicitud();

  const nuevaSolicitud = new Solicitud({
    numeroSolicitud,
    ...data,
    estadoInterno: "PENDIENTE_INICIO_GESTION",
    currentDepartment: "PRESTACIONES",
    lastTechnicalDepartment: null,
    historial: [
      {
        estado: "PENDIENTE_INICIO_GESTION",
        changedBy: user.id,
      },
    ],
  });

  await nuevaSolicitud.save();
  return nuevaSolicitud;
};

const changeStatus = async (solicitudId, nuevoEstado, user) => {
  const solicitud = await Solicitud.findById(solicitudId);

  if (!solicitud) {
    throw new Error("Solicitud no encontrada");
  }

  const estadoActual = solicitud.estadoInterno;

  // Validación de responsabilidad por departamento
  if (
    solicitud.currentDepartment &&
    solicitud.currentDepartment !== user.role
  ) {
    throw new Error(
      "No puedes actuar sobre una solicitud que pertenece a otro departamento",
    );
  }

  // 1️⃣ Validación estructural (máquina de estados)
  const allowedNextStates = solicitudFlowRules[estadoActual];

  if (!allowedNextStates || !allowedNextStates.includes(nuevoEstado)) {
    throw new Error(
      `Transición no permitida de ${estadoActual} a ${nuevoEstado}`,
    );
  }

  // 2️⃣ Restricción específica para devolución tras revisión administrativa
  if (estadoActual === "PENDIENTE_REVISION_PRESTACIONES") {
    const expectedState =
      solicitud.lastTechnicalDepartment === "DIRECCION_MEDICA"
        ? "PENDIENTE_DIRECCION_MEDICA"
        : "PENDIENTE_ASESORIA_JURIDICA";

    if (nuevoEstado !== expectedState) {
      throw new Error(
        "Solo puede devolverse al departamento técnico que solicitó la documentación",
      );
    }
  }

  // 3️⃣ Validaciones por rol

  if (user.role === "PRESTACIONES") {
    if (
      ![
        "PENDIENTE_DIRECCION_MEDICA",
        "AUTORIZADA",
        "RECHAZADA",
        "PENDIENTE_REVISION_PRESTACIONES",
      ].includes(nuevoEstado)
    ) {
      throw new Error("Transición no permitida para PRESTACIONES");
    }

    // Si estamos en revisión tras documentación,
    // Prestaciones solo redistribuye
    if (estadoActual === "PENDIENTE_REVISION_PRESTACIONES") {
      if (
        !["PENDIENTE_DIRECCION_MEDICA", "PENDIENTE_ASESORIA_JURIDICA"].includes(
          nuevoEstado,
        )
      ) {
        throw new Error(
          "Prestaciones solo puede devolver al departamento técnico correspondiente",
        );
      }
    }
  }

  if (user.role === "DIRECCION_MEDICA") {
    if (
      ![
        "AUTORIZADA",
        "RECHAZADA",
        "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO",
      ].includes(nuevoEstado)
    ) {
      throw new Error("Transición no permitida para DIRECCION_MEDICA");
    }
  }

  if (user.role === "ASESORIA_JURIDICA") {
    if (
      ![
        "AUTORIZADA",
        "RECHAZADA",
        "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO",
      ].includes(nuevoEstado)
    ) {
      throw new Error("Transición no permitida para ASESORIA_JURIDICA");
    }
  }

  // 4️⃣ Si un departamento técnico pide documentación,
  // guardamos quién la solicitó
  if (
    nuevoEstado === "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO" &&
    (user.role === "DIRECCION_MEDICA" || user.role === "ASESORIA_JURIDICA")
  ) {
    solicitud.lastTechnicalDepartment = user.role;
  }

  // 5️⃣ Actualizar estado
  solicitud.estadoInterno = nuevoEstado;

  // 6️⃣ Actualizar departamento responsable
  if (nuevoEstado === "PENDIENTE_INICIO_GESTION") {
    solicitud.currentDepartment = "PRESTACIONES";
  }

  if (nuevoEstado === "PENDIENTE_DIRECCION_MEDICA") {
    solicitud.currentDepartment = "DIRECCION_MEDICA";
  }

  if (nuevoEstado === "PENDIENTE_ASESORIA_JURIDICA") {
    solicitud.currentDepartment = "ASESORIA_JURIDICA";
  }

  if (nuevoEstado === "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO") {
    solicitud.currentDepartment = null; // Esperando al asegurado
  }

  if (nuevoEstado === "PENDIENTE_REVISION_PRESTACIONES") {
    solicitud.currentDepartment = "PRESTACIONES";
  }

  if (nuevoEstado === "AUTORIZADA" || nuevoEstado === "RECHAZADA") {
    solicitud.currentDepartment = null;
  }

  // 7️⃣ Añadir historial
  solicitud.historial.push({
    estado: nuevoEstado,
    changedBy: user.id,
  });

  await solicitud.save();

  return solicitud;
};

const getSolicitudesByRole = async (user) => {
  return await Solicitud.find().sort({ createdAt: -1 });
};

module.exports = { createSolicitud, changeStatus, getSolicitudesByRole };
