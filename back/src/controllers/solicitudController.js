const solicitudService = require("../services/solicitudService");

const {
  mapSolicitud,
  mapSolicitudes,
} = require("../transformers/solicitudTransformer");

/* ==============================
GET /solicitudes
============================== */

const getSolicitudes = async (req, res) => {
  try {
    const solicitudes = await solicitudService.getSolicitudes();

    res.json({
      solicitudes: mapSolicitudes(solicitudes),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error obteniendo solicitudes",
    });
  }
};

/* ==============================
GET /solicitudes/:id
============================== */

const getSolicitudById = async (req, res) => {
  try {
    const solicitud = await solicitudService.getSolicitudById(req.params.id);

    if (!solicitud) {
      return res.status(404).json({
        message: "Solicitud no encontrada",
      });
    }

    res.json(mapSolicitud(solicitud));
  } catch (error) {
    res.status(500).json({
      message: "Error obteniendo solicitud",
    });
  }
};

/* ==============================
POST /solicitudes/:id/autorizar
============================== */

const authorizeSolicitud = async (req, res) => {
  try {
    const { solicitud, pdf } = await solicitudService.authorizeSolicitud(
      req.params.id,
    );

    res.json({
      message: "Solicitud autorizada correctamente",
      solicitud,
      pdf,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* ==============================
POST /solicitudes/:id/rechazar
============================== */

const rejectSolicitud = async (req, res) => {
  try {
    const solicitud = await solicitudService.rejectSolicitud(
      req.params.id,
      req.body.comentario,
    );

    res.json({
      message: "Solicitud rechazada correctamente",
      solicitud,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* ==============================
POST /solicitudes/:id/solicitar-documentacion
============================== */

const requestDocumentation = async (req, res) => {
  try {
    const solicitud = await solicitudService.requestDocumentation(
      req.params.id,
      req.body.documentosSolicitados,
    );

    res.json({
      message: "Documentación solicitada correctamente",
      solicitud,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* ==============================
POST /solicitudes/:id/enviar-direccion-medica
============================== */

const sendToDireccionMedica = async (req, res) => {
  try {
    const solicitud = await solicitudService.sendToDireccionMedica(
      req.params.id,
    );

    res.json({
      message: "Solicitud enviada a dirección médica",
      solicitud,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* ==============================
POST /solicitudes/:id/enviar-asesoria-juridica
============================== */

const sendToAsesoriaJuridica = async (req, res) => {
  try {
    const solicitud = await solicitudService.sendToAsesoriaJuridica(
      req.params.id,
    );

    res.json({
      message: "Solicitud enviada a asesoría jurídica",
      solicitud,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getSolicitudes,
  getSolicitudById,
  authorizeSolicitud,
  rejectSolicitud,
  requestDocumentation,
  sendToDireccionMedica,
  sendToAsesoriaJuridica,
};
