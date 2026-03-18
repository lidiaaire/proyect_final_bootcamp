const API_URL = "http://localhost:4000/api";

export async function getChannelMessages(channel) {
  const res = await fetch(`${API_URL}/communications/${channel}`);

  return res.json();
}

export async function sendMessage(data) {
  const res = await fetch(`${API_URL}/communications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
}
