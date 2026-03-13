// src/controllers/rechazarSolicitudController.js

const Solicitud = require("../models/solicitudModel");
const { enviarEmailSimulado } = require("../services/emailSimulationService");

/*
POST /api/solicitudes/:id/rechazar

Body:
{
  motivo: "NO_CUBIERTO_POLIZA",
  comentario: "Texto opcional"
}
*/

async function rechazarSolicitud(req, res) {
  try {
    const { id } = req.params;
    const { motivo, comentario } = req.body;

    const solicitud = await Solicitud.findById(id);

    if (!solicitud) {
      return res.status(404).json({
        message: "Solicitud no encontrada",
      });
    }

    // 1 Cambiar estado
    solicitud.estadoInterno = "RECHAZADA";
    solicitud.currentDepartment = null;

    // 2 Guardar motivo
    solicitud.motivoRechazo = motivo;
    solicitud.comentarioRechazo = comentario;

    // 3 Historial
    solicitud.historial.push({
      estado: "RECHAZADA",
      changedBy: "PRESTACIONES",
      fecha: new Date(),
    });

    await solicitud.save();

    // 4 Email simulado
    const email = {
      to: solicitud.nombreCompleto,
      subject: "Resolución de su solicitud",
      body: `
Estimado/a ${solicitud.nombreCompleto},

Lamentamos informarle que su solicitud (${solicitud.numeroSolicitud})
ha sido rechazada.

Motivo:
${motivo}

Comentario adicional:
${comentario || "No se proporcionó información adicional."}

Atentamente,
Departamento de Prestaciones
`,
    };

    enviarEmailSimulado(email);

    res.json({
      message: "Solicitud rechazada correctamente",
      solicitud,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al rechazar la solicitud",
    });
  }
}

module.exports = {
  rechazarSolicitud,
};
