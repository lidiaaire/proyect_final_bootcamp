import { useState, useEffect } from "react";
import styles from "../../../styles/Comunicaciones.module.css";

import ChannelList from "../ChannelList/ChannelList";
import MessageList from "../MessageList/MessageList";
import MessageInput from "../MessageInput/MessageInput";
import MembersPanel from "../MembersPanel/MembersPanel";

import { getChannelMessages } from "@/api/communications";

export default function ComunicacionesLayout() {
  const [selectedChannel, setSelectedChannel] = useState("Avisos Oficiales");
  const [messages, setMessages] = useState([]);

  const channels = [
    "Avisos Oficiales",
    "Prestaciones",
    "Dirección Médica",
    "Asesoría Jurídica",
    "General",
  ];

  const members = [
    { name: "Laura Gómez", department: "Prestaciones", avatar: "LG" },
    { name: "Carlos Méndez", department: "Prestaciones", avatar: "CM" },
    { name: "Marta Ruiz", department: "Dirección Médica", avatar: "MR" },
    { name: "Luis Herrera", department: "Asesoría Jurídica", avatar: "LH" },
  ];

  useEffect(() => {
    async function fetchMessages() {
      const data = await getChannelMessages(selectedChannel);

      setMessages(data);
    }

    fetchMessages();
  }, [selectedChannel]);

  return (
    <div className={styles.container}>
      <ChannelList
        channels={channels}
        selectedChannel={selectedChannel}
        setSelectedChannel={setSelectedChannel}
      />

      <div className={styles.chatArea}>
        <MessageList channel={selectedChannel} messages={messages} />

        <MessageInput channel={selectedChannel} />
      </div>

      <MembersPanel members={members} />
    </div>
  );
}
