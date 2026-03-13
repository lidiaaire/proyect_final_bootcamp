// src/controllers/solicitarDocumentacionController.js

const Solicitud = require("../models/solicitudModel");
const {
  generarEmailSolicitudDocumentacion,
  enviarEmailSimulado,
} = require("../services/emailSimulationService");

/*
POST /api/solicitudes/:id/solicitar-documentacion

Body:
{
  documentosSolicitados: ["historia_clinica", "prescripcion_medica"]
}
*/

async function solicitarDocumentacion(req, res) {
  try {
    const { id } = req.params;
    const { documentosSolicitados } = req.body;

    const solicitud = await Solicitud.findById(id);

    if (!solicitud) {
      return res.status(404).json({ message: "Solicitud no encontrada" });
    }

    // 1️⃣ Cambiar estado
    solicitud.estadoInterno = "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO";
    solicitud.currentDepartment = "PRESTACIONES";

    // 2️⃣ Guardar historial
    solicitud.historial.push({
      estado: "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO",
      changedBy: "PRESTACIONES",
      fecha: new Date(),
    });

    // 3️⃣ Guardar qué documentos se solicitaron
    solicitud.documentosSolicitados = documentosSolicitados;

    await solicitud.save();

    // 4️⃣ Generar email simulado
    const email = generarEmailSolicitudDocumentacion(
      solicitud,
      documentosSolicitados,
    );

    enviarEmailSimulado(email);

    res.json({
      message: "Documentación solicitada correctamente",
      emailSimulado: email,
      solicitud,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error solicitando documentación",
    });
  }
}

module.exports = {
  solicitarDocumentacion,
};
