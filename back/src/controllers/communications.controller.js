const messages = [
  {
    id: "msg1",
    channel: "Avisos Oficiales",
    user: "Dra. Marta Ruiz",
    role: "Dirección Médica",
    avatar: "MR",
    text: "Nueva indicación: las resonancias requieren informe previo.",
    time: "10:30",
  },
  {
    id: "msg2",
    channel: "Prestaciones",
    user: "Carlos Méndez",
    role: "Prestaciones",
    avatar: "CM",
    text: "Procedimiento actualizado en el sistema.",
    time: "11:20",
  },
];

function getMessages(req, res) {
  const { channel } = req.params;

  const filtered = messages.filter((m) => m.channel === channel);

  res.json(filtered);
}

function sendMessage(req, res) {
  const newMessage = {
    id: Date.now().toString(),
    ...req.body,
  };

  messages.push(newMessage);

  res.status(201).json(newMessage);
}

module.exports = {
  getMessages,
  sendMessage,
};
