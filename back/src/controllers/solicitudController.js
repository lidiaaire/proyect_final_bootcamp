const { createSolicitud } = require("../services/solicitudService");
const { changeStatus } = require("../services/solicitudService");
const { getSolicitudesByRole } = require("../services/solicitudService");

const createSolicitudController = async (req, res) => {
  try {
    const solicitud = await createSolicitud(req.body, req.user);

    res.status(201).json(solicitud);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const changeStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevoEstado } = req.body;

    const solicitud = await changeStatus(id, nuevoEstado, req.user);

    res.status(200).json(solicitud);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getSolicitudesController = async (req, res) => {
  try {
    const solicitudes = await getSolicitudesByRole(req.user);
    res.status(200).json(solicitudes);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createSolicitudController,
  changeStatusController,
  getSolicitudesController,
};
