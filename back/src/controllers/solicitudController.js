const requests = require("../mocks/requests");
const { policyholders } = require("../mocks/policyholders");

const mapSolicitud = (req) => {
  const policyholder = policyholders.find(
    (p) => String(p.id) === String(req.policyholderId),
  );

  return {
    _id: req.id,
    id: req.id,
    policyholderId: req.policyholderId,

    nombreCompleto: policyholder ? `${policyholder.name}` : "Desconocido",
    poliza: req.policyholderId,
    dni: policyholder?.dni || "",

    nombrePrueba: req.service,
    especialidad: req.specialty,
    centroMedico: req.medicalCenter,

    estadoInterno: req.status,
    createdAt: req.date,

    documentos: [
      {
        nombre: "Informe médico",
        url: "/docs/informe.pdf",
      },
      {
        nombre: "Solicitud médica",
        url: "/docs/solicitud.pdf",
      },
    ],

    historial: [
      {
        estado: "SOLICITUD_CREADA",
        fecha: req.date,
        usuario: "Sistema",
      },
      {
        estado: req.status,
        fecha: req.date,
        usuario: "Equipo Prestaciones",
      },
    ],
    notasInternas: [
      {
        usuario: "Prestaciones",
        fecha: req.date,
        texto: "Pendiente de revisión inicial",
      },
    ],
  };
};

const getSolicitudesController = (req, res) => {
  try {
    const solicitudes = requests.map(mapSolicitud);
    res.json(solicitudes);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo solicitudes" });
  }
};

const getSolicitudByIdController = (req, res) => {
  try {
    const solicitud = requests.find((r) => r.id === req.params.id);

    if (!solicitud) {
      return res.status(404).json({ message: "Solicitud no encontrada" });
    }

    res.json(mapSolicitud(solicitud));
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo solicitud" });
  }
};

const createSolicitudController = (req, res) => {
  res.json({ message: "Crear solicitud (mock)" });
};

const changeStatusController = (req, res) => {
  res.json({ message: "Cambio de estado (mock)" });
};

module.exports = {
  getSolicitudesController,
  getSolicitudByIdController,
  createSolicitudController,
  changeStatusController,
};
