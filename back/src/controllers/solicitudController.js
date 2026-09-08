// Este archivo contiene los controladores para las rutas de solicitudes (obtener todas las solicitudes, obtener una solicitud por ID, solicitar documentación, enviar a dirección médica, enviar a asesoría jurídica, autorizar y rechazar solicitudes).
// Aquí se manejan las solicitudes entrantes, se validan los datos y se llaman a los servicios correspondientes para realizar la lógica de negocio relacionada con las solicitudes.

const solicitudService = require("../services/solicitudService");

const {
  mapSolicitud,
  mapSolicitudes,
} = require("../transformers/solicitudTransformer");

// Errores de transición (InvalidTransitionError) y de "no encontrada"
// llevan su propio `statusCode`. Cualquier otro error se trata como 500.
function respondError(res, error, fallbackMessage) {
  const status = error.statusCode || 500;
  const body = { message: error.message || fallbackMessage };
  if (error.code) body.code = error.code;
  if (error.errors) body.errors = error.errors;
  res.status(status).json(body);
}

/* ==============================
POST /solicitudes
============================== */
const createSolicitud = async (req, res) => {
  try {
    const solicitud = await solicitudService.createSolicitud(req.body, req.user);

    res.status(201).json({
      message: "Solicitud creada correctamente",
      solicitud: mapSolicitud(solicitud),
    });
  } catch (error) {
    respondError(res, error, "Error creando la solicitud");
  }
};

/* ==============================
GET /solicitudes
============================== */
const getSolicitudes = async (req, res) => {
  try {
    const solicitudes = await solicitudService.getSolicitudes(req.user?.role);

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
      await solicitudService.getSolicitudesByPolicyholder(numeroPoliza, req.user?.role);

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
    const solicitud = await solicitudService.getSolicitudById(
      req.params.id,
      req.user?.role,
    );

    if (!solicitud) {
      return res.status(404).json({
        message: "Solicitud no encontrada",
      });
    }

    res.json(mapSolicitud(solicitud));
  } catch (error) {
    respondError(res, error, "Error obteniendo solicitud");
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
    respondError(res, error, "Error solicitando documentación");
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
    respondError(res, error, "Error enviando la solicitud a Dirección Médica");
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
    respondError(res, error, "Error enviando la solicitud a Asesoría Jurídica");
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

    respondError(res, error, "Error autorizando la solicitud");
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
    respondError(res, error, "Error rechazando la solicitud");
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
  createSolicitud,
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
