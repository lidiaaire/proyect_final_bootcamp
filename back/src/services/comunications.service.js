import { messagesDB } from "../mocks/communications.db.js";

export function getMessagesByChannel(channel) {
  return messagesDB.filter((m) => m.channel === channel);
}

export function createMessage(data) {
  const newMessage = {
    id: Date.now().toString(),
    ...data,
  };

  messagesDB.push(newMessage);

  return newMessage;
}
