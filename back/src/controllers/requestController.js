const Solicitud = require("../models/solicitudModel");

const {
  generarAutorizacionPDF,
} = require("../services/generarAutorizacionPDF");

const {
  enviarEmailSimulado,
  generarEmailSolicitudDocumentacion,
} = require("../services/emailSimulationService");

const {
  mapRequest,
  mapRequests,
} = require("../transformers/requestTransformer");

/* ==============================
GET /solicitudes
============================== */

const getRequests = async (req, res) => {
  try {
    const solicitudes = await Solicitud.find().sort({ createdAt: -1 });

    res.json(mapRequests(solicitudes));
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo solicitudes" });
  }
};

/* ==============================
GET /solicitudes/:id
============================== */

const getRequestById = async (req, res) => {
  try {
    const solicitud = await Solicitud.findById(req.params.id);

    if (!solicitud) {
      return res.status(404).json({
        message: "Solicitud no encontrada",
      });
    }

    res.json(mapRequest(solicitud));
  } catch (error) {
    res.status(500).json({
      message: "Error obteniendo solicitud",
    });
  }
};

/* ==============================
POST /solicitudes/:id/autorizar
============================== */

const authorizeRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const solicitud = await Solicitud.findById(id);

    if (!solicitud) {
      return res.status(404).json({
        message: "Solicitud no encontrada",
      });
    }

    solicitud.estadoInterno = "AUTORIZADA";
    solicitud.currentDepartment = null;

    solicitud.historial.push({
      estado: "AUTORIZADA",
      changedBy: "DIRECCION_MEDICA",
      fecha: new Date(),
    });

    const pdf = generarAutorizacionPDF(solicitud);

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

    const email = {
      to: solicitud.nombreCompleto,
      subject: "Autorización concedida",
      body: `Solicitud ${solicitud.numeroSolicitud} autorizada`,
    };

    enviarEmailSimulado(email);

    res.json({
      message: "Solicitud autorizada correctamente",
      solicitud,
      pdf,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al autorizar solicitud",
    });
  }
};

/* ==============================
POST /solicitudes/:id/rechazar
============================== */

const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { comentario } = req.body;

    const solicitud = await Solicitud.findById(id);

    if (!solicitud) {
      return res.status(404).json({
        message: "Solicitud no encontrada",
      });
    }

    solicitud.estadoInterno = "RECHAZADA";
    solicitud.currentDepartment = null;

    solicitud.historial.push({
      estado: "RECHAZADA",
      changedBy: "PRESTACIONES",
      comentario,
      fecha: new Date(),
    });

    await solicitud.save();

    enviarEmailSimulado({
      to: solicitud.nombreCompleto,
      subject: "Solicitud rechazada",
      body: comentario,
    });

    res.json({
      message: "Solicitud rechazada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error rechazando solicitud",
    });
  }
};

/* ==============================
POST /solicitudes/:id/solicitar-documentacion
============================== */

const requestDocumentation = async (req, res) => {
  try {
    const { id } = req.params;
    const { documentosSolicitados } = req.body;

    const solicitud = await Solicitud.findById(id);

    if (!solicitud) {
      return res.status(404).json({
        message: "Solicitud no encontrada",
      });
    }

    solicitud.estadoInterno = "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO";
    solicitud.currentDepartment = "PRESTACIONES";

    solicitud.historial.push({
      estado: "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO",
      changedBy: "PRESTACIONES",
      documentosSolicitados,
      fecha: new Date(),
    });

    await solicitud.save();

    const email = generarEmailSolicitudDocumentacion(
      solicitud,
      documentosSolicitados,
    );

    enviarEmailSimulado(email);

    res.json({
      message: "Documentación solicitada correctamente",
      solicitud,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error solicitando documentación",
    });
  }
};

module.exports = {
  getRequests,
  getRequestById,
  authorizeRequest,
  rejectRequest,
  requestDocumentation,
};
