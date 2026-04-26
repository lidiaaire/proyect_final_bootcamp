// Este archivo contiene los controladores para las rutas de solicitudes (obtener todas las solicitudes, obtener una solicitud por ID, solicitar documentación, enviar a dirección médica, enviar a asesoría jurídica, autorizar y rechazar solicitudes).
// Aquí se manejan las solicitudes entrantes, se validan los datos y se llaman a los servicios correspondientes para realizar la lógica de negocio relacionada con las solicitudes.

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
GET /solicitudes/policyholder/:numeroPoliza
============================== */

const getSolicitudesByPolicyholder = async (req, res) => {
  try {
    const { numeroPoliza } = req.params;

    const solicitudes =
      await solicitudService.getSolicitudesByPolicyholder(numeroPoliza);

    res.json({
      solicitudes: mapSolicitudes(solicitudes),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error obteniendo solicitudes por póliza",
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
    const { justificacion } = req.body || {};

    const solicitud = await solicitudService.requestDocumentation(
      req.params.id,
      req.user,
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
    const { justificacion } = req.body || {};

    const solicitud = await solicitudService.sendToMedicalDirection(
      req.params.id,
      req.user,
      justificacion,
    );

    res.json({
      message: "Solicitud enviada a Dirección Médica",
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
    const { justificacion } = req.body || {};

    const solicitud = await solicitudService.sendToLegalAdvisory(
      req.params.id,
      req.user,
      justificacion,
    );

    res.json({
      message: "Solicitud enviada a Asesoría Jurídica",
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
    const { justificacion } = req.body || {};

    const solicitud = await solicitudService.authorizeRequest(
      req.params.id,
      req.user,
      justificacion,
    );

    res.json({
      message: "Solicitud autorizada correctamente",
      solicitud: mapSolicitud(solicitud),
    });
  } catch (error) {
    console.error("ERROR AUTORIZAR:", error);

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
    const { justificacion } = req.body || {};

    const solicitud = await solicitudService.rejectRequest(
      req.params.id,
      req.user,
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

/* ==============================
POST /solicitudes/:id/notas
============================== */
const addNota = async (req, res) => {
  try {
    const { descripcion } = req.body || {};

    if (!descripcion || !descripcion.trim()) {
      return res.status(400).json({ message: "La nota no puede estar vacía" });
    }

    const solicitud = await solicitudService.addNota(
      req.params.id,
      req.user,
      descripcion.trim(),
    );

    res.status(201).json({
      message: "Nota añadida correctamente",
      solicitud: mapSolicitud(solicitud),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
  getSolicitudesByPolicyholder,
  addNota,
};
