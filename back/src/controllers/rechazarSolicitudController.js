const Solicitud = require("../models/solicitudModel");
const { enviarEmailSimulado } = require("../services/emailSimulationService");

async function rechazarSolicitud(req, res) {
  try {
    const { id } = req.params;
    const { comentario } = req.body;

    const solicitud = await Solicitud.findById(id);

    if (!solicitud) {
      return res.status(404).json({
        message: "Solicitud no encontrada",
      });
    }

    // Cambiar estado
    solicitud.estadoInterno = "RECHAZADA";
    solicitud.currentDepartment = null;

    // Guardar en historial
    solicitud.historial.push({
      estado: "RECHAZADA",
      changedBy: "PRESTACIONES",
      comentario: comentario,
      fecha: new Date(),
    });

    await solicitud.save();

    // Email simulado
    const email = {
      to: solicitud.nombreCompleto,
      subject: "Solicitud rechazada",
      body: `
Estimado/a ${solicitud.nombreCompleto},

Su solicitud (${solicitud.numeroSolicitud}) ha sido RECHAZADA.

Motivo:
${comentario}

Si necesita más información puede contactar con su aseguradora.

Atentamente,
Departamento de prestaciones
`,
    };

    enviarEmailSimulado(email);

    res.json({
      message: "Solicitud rechazada correctamente",
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
