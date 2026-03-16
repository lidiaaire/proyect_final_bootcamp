console.log("CONTROLADOR DE SOLICITUDES CARGADO");

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
POST /solicitudes/:id/solicitar-documentacion
============================== */

const requestDocumentation = async (req, res) => {
  try {
    const rol = req.user?.role || "prestaciones";
    const { justificacion } = req.body;

    const solicitud = await solicitudService.requestDocumentation(
      req.params.id,
      rol,
      justificacion,
    );

    res.json({
      message: "Documentación solicitada correctamente",
      solicitud: mapSolicitud(solicitud),
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
    const rol = req.user?.role || "prestaciones";
    const { justificacion } = req.body;

    const solicitud = await solicitudService.sendToMedicalDirection(
      req.params.id,
      rol,
      justificacion,
    );

    res.json({
      message: "Solicitud enviada a dirección médica",
      solicitud: mapSolicitud(solicitud),
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
    const rol = req.user?.role || "prestaciones";
    const { justificacion } = req.body;

    const solicitud = await solicitudService.sendToLegalAdvisory(
      req.params.id,
      rol,
      justificacion,
    );

    res.json({
      message: "Solicitud enviada a asesoría jurídica",
      solicitud: mapSolicitud(solicitud),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* ==============================
POST /solicitudes/:id/autorizar
============================== */

const authorizeSolicitud = async (req, res) => {
  try {
    const rol = "direccionmedica";
    const { justificacion } = req.body;

    const solicitud = await solicitudService.authorizeRequest(
      req.params.id,
      rol,
      justificacion,
    );

    res.json({
      message: "Solicitud autorizada correctamente",
      solicitud: mapSolicitud(solicitud),
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
    const rol = req.user?.role || "prestaciones";
    const { justificacion } = req.body;

    const solicitud = await solicitudService.rejectRequest(
      req.params.id,
      rol,
      justificacion,
    );

    res.json({
      message: "Solicitud rechazada correctamente",
      solicitud: mapSolicitud(solicitud),
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
  requestDocumentation,
  sendToDireccionMedica,
  sendToAsesoriaJuridica,
  authorizeSolicitud,
  rejectSolicitud,
};
