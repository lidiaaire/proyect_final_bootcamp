// src/controllers/autorizarSolicitudController.js

const Solicitud = require("../models/solicitudModel");
const {
  generarAutorizacionPDF,
} = require("../services/generarAutorizacionPDF");
const { enviarEmailSimulado } = require("../services/emailSimulationService");

/*
POST /api/solicitudes/:id/autorizar
*/

async function autorizarSolicitud(req, res) {
  try {
    const { id } = req.params;

    const solicitud = await Solicitud.findById(id);

    if (!solicitud) {
      return res.status(404).json({
        message: "Solicitud no encontrada",
      });
    }

    // 1️⃣ Cambiar estado
    solicitud.estadoInterno = "AUTORIZADA";
    solicitud.currentDepartment = null;

    // 2️⃣ Historial
    solicitud.historial.push({
      estado: "AUTORIZADA",
      changedBy: "DIRECCION_MEDICA",
      fecha: new Date(),
    });

    // 3️⃣ Generar PDF
    const pdf = generarAutorizacionPDF(solicitud);

    // 4️⃣ Guardar documento en la solicitud
    if (!solicitud.documentos) {
      solicitud.documentos = [];
    }

    solicitud.documentos.push({
      nombre: pdf.nombre,
      tipo: "AUTORIZACION",
      subidoPor: "SISTEMA",
      fecha: new Date(),
      url: pdf.url,
    });

    await solicitud.save();

    // 5️⃣ Email simulado
    const email = {
      to: solicitud.nombreCompleto,
      subject: "Autorización concedida",
      body: `
Estimado/a ${solicitud.nombreCompleto},

Le informamos que su solicitud (${solicitud.numeroSolicitud})
ha sido AUTORIZADA.

Adjunto encontrará el documento de autorización.

Prueba:
${solicitud.nombrePrueba}

Centro médico:
${solicitud.centroMedico}

Atentamente,
Departamento médico
`,
    };

    enviarEmailSimulado(email);

    res.json({
      message: "Solicitud autorizada correctamente",
      solicitud,
      pdf,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al autorizar la solicitud",
    });
  }
}

module.exports = {
  autorizarSolicitud,
};
