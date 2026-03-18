import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "../../../styles/Communications.module.css";
import MembersPanel from "../MembersPanel/MembersPanel";

import { getChannelMessages } from "@/api/communications";

export default function CommunicationsLayout({ children }) {
  const router = useRouter();
  const { channel } = router.query;

  const [messages, setMessages] = useState([]);

  // 🔹 Map URL → nombre real
  const channelMap = {
    "avisos-oficiales": "Avisos Oficiales",
    prestaciones: "Prestaciones",
    "direccion-medica": "Dirección Médica",
    "asesoria-juridica": "Asesoría Jurídica",
    general: "General",
  };

  const currentChannel = channelMap[channel];

  const channels = Object.keys(channelMap);

  const members = [
    // 🔹 RESPONSABLE
    { name: "María López", department: "Responsable", avatar: "ML" },

    // 🔹 PRESTACIONES (equipo grande)
    { name: "Laura Gómez", department: "Prestaciones", avatar: "LG" },
    { name: "Carlos Méndez", department: "Prestaciones", avatar: "CM" },
    { name: "Ana Beltrán", department: "Prestaciones", avatar: "AB" },
    { name: "Pedro Ruiz", department: "Prestaciones", avatar: "PR" },
    { name: "Lucía Fernández", department: "Prestaciones", avatar: "LF" },
    { name: "Javier Martín", department: "Prestaciones", avatar: "JM" },
    { name: "Sofía Torres", department: "Prestaciones", avatar: "ST" },
    { name: "David Navarro", department: "Prestaciones", avatar: "DN" },
    { name: "Elena Sánchez", department: "Prestaciones", avatar: "ES" },
    { name: "Pablo Ortega", department: "Prestaciones", avatar: "PO" },
    { name: "Raquel Díaz", department: "Prestaciones", avatar: "RD" },
    { name: "Iván Romero", department: "Prestaciones", avatar: "IR" },
    { name: "Marta Gil", department: "Prestaciones", avatar: "MG" },
    { name: "Álvaro Castro", department: "Prestaciones", avatar: "AC" },
    { name: "Carmen Vega", department: "Prestaciones", avatar: "CV" },
    { name: "Nuria León", department: "Prestaciones", avatar: "NL" },
    { name: "Hugo Prieto", department: "Prestaciones", avatar: "HP" },
    { name: "Claudia Ramos", department: "Prestaciones", avatar: "CR" },
    { name: "Diego Molina", department: "Prestaciones", avatar: "DM" },
    { name: "Patricia Serrano", department: "Prestaciones", avatar: "PS" },
    { name: "Sergio Lozano", department: "Prestaciones", avatar: "SL" },
    { name: "Andrea Pardo", department: "Prestaciones", avatar: "AP" },
    { name: "Mario Iglesias", department: "Prestaciones", avatar: "MI" },
    { name: "Beatriz Calvo", department: "Prestaciones", avatar: "BC" },
    { name: "Óscar Herrera", department: "Prestaciones", avatar: "OH" },
    { name: "Lidia Navarro", department: "Prestaciones", avatar: "LN" },
    { name: "Tomás Rubio", department: "Prestaciones", avatar: "TR" },
    { name: "Cristina Peña", department: "Prestaciones", avatar: "CP" },
    { name: "Daniel Suárez", department: "Prestaciones", avatar: "DS" },
    { name: "Eva Morales", department: "Prestaciones", avatar: "EM" },

    // 🔹 DIRECCIÓN MÉDICA
    { name: "Dr. Javier López", department: "Dirección Médica", avatar: "JL" },

    // 🔹 ASESORÍA JURÍDICA
    { name: "Luis Herrera", department: "Asesoría Jurídica", avatar: "LH" },
  ];

  // 🔹 Cargar mensajes según canal (URL)
  useEffect(() => {
    if (!currentChannel) return;

    async function fetchMessages() {
      const data = await getChannelMessages(channel);
      setMessages(data);
      console.log("DATA:", data);
    }

    fetchMessages();
  }, [channel]);

  // 🔹 Detectar si estamos en selector o canal
  const isChannelPage =
    router.pathname.startsWith("/comunicaciones/") &&
    router.pathname !== "/comunicaciones";

  return (
    <div className={styles.container}>
      <div className={styles.chatArea}>
        {children && typeof children === "function"
          ? children({ messages, currentChannel })
          : children}
      </div>

      {isChannelPage && <MembersPanel members={members} />}
    </div>
  );
}
