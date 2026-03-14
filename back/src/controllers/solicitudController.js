const requests = require("../mocks/requests");

const getSolicitudesController = (req, res) => {
  try {
    res.json(requests);
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

    res.json(solicitud);
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
